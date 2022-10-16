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
    
    // files are currently just a list of everything, we want to 
    // parse that into a data structure that will allow for easier analysis/search
    let file_data_structure = parseFiles(files, root_id)
    
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

// get the top level files, then populate all subfiles recursively
function parseFiles(all_files, root_id) {
  let top_level_files = []
  for (let file of all_files) {
    // shared top level files have no parents, mydrive top level has root as parent
    if (!file.parents || root_id == file.parents) {

      // create a file object and array of permission objects
      let permissions = file.permissions ? file.permissions.map(p => {
        return new Permission({
          email: p.emailAddress,
          role: p.role,
          type: p.type,
          domain: p.domain,
          permissionDetails: p.permissionDetails ? p.permissionDetails : undefined 
        });
      }) : undefined;

      let file_object = new File({
          id: file.id,
          name: file.name,
          mimeType: file.mimeType,
          modifiedTime: file.modifiedTime,
          path: '/' + file.name, 
          parent: file.parents ? file.parents[0] : undefined,
          thumbnailLink: file.thumbnailLink? file.thumbnailLink : undefined, 
          sharingUser: file.sharingUser ? file.sharingUser : undefined,
          owners: file.owners ? file.owners : undefined,
          driveId: file.driveId,
          permissions: permissions
      });
      top_level_files.push(file_object)
    } 
  }

  // now, populate all the subfolders of the top level folders, and recursively populate any other subfolders
  populateSubfolders(top_level_files, all_files, "/")
  return top_level_files
}

function populateSubfolders(files_to_populate, all_files, current_path) {
  // go through every file, and for each folder
  for(let top_level_file of files_to_populate) {
    if(top_level_file.mimeType === 'application/vnd.google-apps.folder') {
      top_level_file.content = []

      //search through all files to find the children of this folder
      for(let child_file_candidate of all_files) {
        if(child_file_candidate.parents) {
          if (top_level_file.id == child_file_candidate.parents || top_level_file.id in child_file_candidate.parents) {

            // create new permissions objects and new file object
            let permissions = child_file_candidate.permissions ? child_file_candidate.permissions.map(p => {
              return new Permission({
                email: p.emailAddress,
                role: p.role,
                type: p.type,
                domain: p.domain,
                permissionDetails: p.permissionDetails ? p.permissionDetails : undefined
              });
            }) : undefined;

            // add child to parent's content list
            let file_object = new File({
              id: child_file_candidate.id,
              name: child_file_candidate.name,
              mimeType: child_file_candidate.mimeType,
              modifiedTime: child_file_candidate.modifiedTime,
              path: current_path + top_level_file.name + '/' + child_file_candidate.name,
              parent: child_file_candidate.parents ? child_file_candidate.parents[0] : undefined,
              thumbnailLink: child_file_candidate.thumbnailLink? child_file_candidate.thumbnailLink : undefined, 
              sharingUser: child_file_candidate.sharingUser ? child_file_candidate.sharingUser : undefined,
              owners: child_file_candidate.owners ? child_file_candidate.owners : undefined,
              driveId: child_file_candidate.driveId,
              permissions: permissions
            })
            top_level_file.content.push(file_object)
          }
        }
      }

      // now, populate any subfolders we just found
      populateSubfolders(top_level_file.content, all_files, current_path + top_level_file.name + '/')
    }
  }
}