import { google } from 'googleapis';
import { getToken } from 'next-auth/jwt';
import User from '../../lib/models/User';
import File from '../../lib/models/File';
import Permission from '../../lib/models/Permission';
import Snapshot from '../../lib/models/Snapshot';

const auth = new google.auth.OAuth2({
  client_id: process.env.GOOGLE_ID,
  client_secret: process.env.GOOGLE_SECRET
});
const drive = google.drive({ auth, version: 'v3' });
const fields = [
  'id', 'name', 'mimeType', 'parents', 'thumbnailLink', 'modifiedTime',
  'sharingUser', 'owners', 'permissions', 'driveId'
];
// Note: there doesn't seem to be a way to see who created a file, only its owner.

export default async function handler(req, res) {
  const token = await getToken({ req });
  if (token && req.method === 'POST') {
    auth.setCredentials({
      access_token: req.body.accessToken
    });

    console.log("taking snapshot...")
    let googleRes = await drive.files.list({
      //fields: '*', // Retrieve all fields - useful for testing
      fields: `files(${fields.join(',')}), nextPageToken`,
      includeItemsFromAllDrives: true,
      supportsAllDrives: true
    });

    let nextpage = googleRes.data.nextPageToken 
    let files = googleRes.data.files

    while(nextpage) {
      googleRes = await drive.files.list({
        //fields: '*', // Retrieve all fields - useful for testing
        fields: `files(${fields.join(',')}), nextPageToken`,
        pageToken: nextpage,
        includeItemsFromAllDrives: true,
        supportsAllDrives: true
      });
    
      nextpage = googleRes.data.nextPageToken
      files = files.concat(googleRes.data.files)
    }

    // root will always alias to the root of the drive, but we want to know its actual id
    // so that we can identify top level folders for easier parsing
    let rootRes = await drive.files.get({
      fileId: 'root',
    })
    let root_id = rootRes.data.id
    
    // many fields aren't populated, so we will go through and populate many of them
    await populateMissingFields(files, root_id)

    // files are currently just a list of everything, we want to 
    // parse that into a data structure that will allow for easier analysis/search
    let file_data_structure = parseFiles(files)
    
    // Save snapshot to database
    let userId = token.user.id;
    let user = await User.findOne({ id: userId });
    let snapshot = new Snapshot({
      date: new Date().toString(),
      user: user.email,
      files: file_data_structure
    })

    // add this snapshot to the user profile
    let saved_snapshot = await snapshot.save()
    let snapshot_id = saved_snapshot._id.toString()
    user.snapshotIDs.unshift(snapshot_id);
    await user.save();

    console.log("success")
    res.json({id: snapshot_id});
  } else {
    res.end('Not signed in or not a POST request.');
  }
}

async function populateMissingFields(all_files, root_id) {
  // mape for driveId's to driveName's so we don't have to repeat queries
  let driveIdToName = new Map()

  for (let file of all_files) {

    // shared drive files are missing different fields from mydrive files
    if(file.driveId) {
      // get the drive name
      if (driveIdToName.has(file.driveId)) {
        file.driveName = driveIdToName.get(file.driveId)
      }
      else {
        let driveRes = await drive.drives.get({driveId: file.driveId})
        file.driveName = driveRes.data.name
        driveIdToName.set(file.driveId, file.driveName)
      }

      // get permmissions
      let permRes = await drive.permissions.list({fileId: file.id, fields: '*', supportsAllDrives: true})
      file.permissions = permRes.data.permissions

      // set folder-related metadata
      // set folder-related metadata
      file.isFolder = (file.mimeType === 'application/vnd.google-apps.folder')
      file.content = []

      // set owners to empty
      file.owners = []
    }
    else {
      // set driveId and driveName
      file.driveId = root_id
      file.driveName = "MyDrive"

      // set folder-related metadata
      file.isFolder = (file.mimeType === 'application/vnd.google-apps.folder')
      file.content = []
    }

  }
}


// get the top level files, then populate all subfiles recursively
function parseFiles(all_files) {
  let top_level_files = []
  for (let file of all_files) {

    // shared top level files have no parents, otherwise, parent is driveID
    if (!file.parents || file.parents.includes(file.driveId)) {

      // create a list of permission objects
      let permissions = file.permissions.map(p => {
        return new Permission({
          email: p.emailAddress,
          role: p.role,
          type: p.type,
          domain: p.domain,
          permissionDetails: p.permissionDetails ? p.permissionDetails : undefined 
        });
      });

      // create a file object for this file, with the list of permissions as a field
      let file_object = new File({
          id: file.id,
          name: file.name,
          mimeType: file.mimeType,
          isFolder: file.isFolder,
          modifiedTime: file.modifiedTime,
          path: '/' + file.name, 
          parents: file.parents ? file.parents : undefined,
          thumbnailLink: file.thumbnailLink? file.thumbnailLink : undefined, 
          sharingUser: file.sharingUser ? file.sharingUser : undefined,
          owners: file.owners,
          driveId: file.driveId,
          driveName: file.driveName,
          permissions: permissions,
          content: file.content
      });

      // add it the array
      top_level_files.push(file_object)
    } 
  }

  // now, populate all the subfolders of the top level folders, and recursively populate any other subfolders
  populateSubfolders(top_level_files, all_files, "/")
  return top_level_files
}

function populateSubfolders(files_to_populate, all_files, current_path) {

  for(let parent_file of files_to_populate) {

    if(parent_file.isFolder) {
      
      //search through all files to find the children of this folder
      for (let file of all_files) {
        if (file.parents.includes(parent_file.id)) {
          
          // create a list of permission objects
          let permissions = file.permissions.map(p => {
            return new Permission({
              email: p.emailAddress,
              role: p.role,
              type: p.type,
              domain: p.domain,
              permissionDetails: p.permissionDetails ? p.permissionDetails : undefined 
            });
          });

          // add child to parent's content list
          let file_object = new File({
            id: file.id,
            name: file.name,
            mimeType: file.mimeType,
            isFolder: file.isFolder,
            modifiedTime: file.modifiedTime,
            path: current_path + parent_file.name + '/' + file.name,
            parents: file.parents ? file.parents : undefined,
            thumbnailLink: file.thumbnailLink? file.thumbnailLink : undefined, 
            sharingUser: file.sharingUser ? file.sharingUser : undefined,
            owners: file.owners,
            driveId: file.driveId,
            driveName: file.driveName,
            permissions: permissions,
            content: file.content
          })

          parent_file.content.push(file_object)
        }
      }

      // now, populate any subfolders we just found
      populateSubfolders(parent_file.content, all_files, current_path + parent_file.content.name + '/')
    }
  }
}