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
// Note: there doesn't seem to be a way to see who created a file, only its current owner.

export default async function takeSnapshot(req, res) {
  const token = await getToken({ req });
  if (token && req.method === 'POST') {
    auth.setCredentials({
      access_token: token.accessToken
    });

    console.time('Snapshot time')
    let googleRes = await drive.files.list({
      //fields: '*', // Retrieve all fields - useful for testing
      fields: `files(${fields.join(',')}), nextPageToken`,
      includeItemsFromAllDrives: true,
      supportsAllDrives: true
    });

    let nextpage = googleRes.data.nextPageToken;
    let files = googleRes.data.files;

    // Continue pagination as long as next page token exists
    while (nextpage) {
      googleRes = await drive.files.list({
        //fields: '*', // Retrieve all fields - useful for testing
        fields: `files(${fields.join(',')}), nextPageToken`,
        pageToken: nextpage,
        includeItemsFromAllDrives: true,
        supportsAllDrives: true
      });
    
      nextpage = googleRes.data.nextPageToken;
      // Append to list of files from previous pages
      files = files.concat(googleRes.data.files);
    }

    // Root will always alias to the root of the drive, but we want to know its actual id
    // so that we can identify top level folders for easier parsing
    let rootRes = await drive.files.get({ fileId: 'root' });
    let root_id = rootRes.data.id;
    
    // Many fields aren't populated, so we will go through and populate many of them
    console.time('populateMissingFields call');
    await populateMissingFields(files, root_id);
    console.timeEnd('populateMissingFields call');

    // Files are currently just a list of everything, we want to 
    // parse that into a data structure to allow for easier analysis/search
    let file_data_structure = parseFiles(files);
    
    // Save snapshot to database
    let userId = token.user.id;
    let user = await User.findOne({ id: userId });
    let snapshot = new Snapshot({
      date: new Date().toString(),
      user: user.email,
      files: file_data_structure
    })

    // Add this snapshot to the user profile
    let saved_snapshot = await snapshot.save()
    let snapshot_id = saved_snapshot._id.toString()
    user.snapshotIDs.unshift(snapshot_id);
    await user.save();

    console.timeEnd('Snapshot time');
    res.json({ id: snapshot_id });
  } else {
    res.end('Not signed in or not a POST request.');
  }
}

async function populateMissingFields(all_files, root_id) {
  // Map for driveIds to driveNames so we don't have to repeat queries
  let driveIdToName = new Map();

  for (let file of all_files) {
    /*
      Save this for when we are creating our data structure.
      We will decrement this counter every time we add a file
      as a subfile of a folder, once it reaches 0,
      we can remove it from the list of all files.
      NOTE: Not all files have a "parent" attribute.
    */
    file.parents_length = file.parents ? file.parents.length : 1;

    // Shared drive files are missing different fields from MyDrive files
    if (file.driveId) {
      // Get the drive name
      if (driveIdToName.has(file.driveId)) 
        file.driveName = driveIdToName.get(file.driveId);
      else {
        let driveRes = await drive.drives.get({
          driveId: file.driveId, 
          fields: 'name', 
          supportsAllDrives: true 
        });
        file.driveName = driveRes.data.name;
        driveIdToName.set(file.driveId, file.driveName);
      }

      // Get permmissions
      let permRes = await drive.permissions.list({
        fileId: file.id, 
        fields: 'permissions(role,emailAddress,type,domain)', 
        supportsAllDrives: true
      });
      file.permissions = permRes.data.permissions;

      // Set folder-related metadata
      file.isFolder = (file.mimeType === 'application/vnd.google-apps.folder');
      file.content = [];

      file.owners = []; // Set owners to empty
    } else {
      // Set driveId and driveName
      file.driveId = root_id;
      file.driveName = 'MyDrive';

      // Set folder-related metadata
      file.isFolder = (file.mimeType === 'application/vnd.google-apps.folder');
      file.content = [];
    }
  }
}


// Get the top level files, then populate all subfiles recursively
function parseFiles(all_files) {
  let top_level_files = [];

  // Iterate using index so we can remove this file from the all files array
  // once we've processed it into our data structure
  for (let i = 0; i < all_files.length; i++) {
    let file = all_files[i];
    //console.log(file);

    // Files shared directly with user have no parent
    // All other top level files have the driveId in the parents list
    if (!file.parents || file.parents.includes(file.driveId)) {
      // Create a list of permission objects
      let permissions = !file.permissions ? [] : file.permissions.map(p => {
        return new Permission({
          email: p.emailAddress,
          role: p.role,
          type: p.type,
          domain: p.domain,
          permissionDetails: p.permissionDetails ? p.permissionDetails : undefined 
        });
      });

      // Create a file object for this file, with the list of permissions as a field
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

      // Add it the array
      top_level_files.push(file_object);

      // We've added it to one of its parents,
      // so check if we can remove it from all files
      file.parents_length -= 1;
      if (file.parents_length == 0) all_files.splice(i, 1);
    } 
  }

  // now, populate all the subfolders of the top level folders, and recursively populate any other subfolders
  populateSubfolders(top_level_files, all_files, '/');
  return top_level_files;
}

function populateSubfolders(files_to_populate, all_files, current_path) {
  for (let parent_file of files_to_populate) {
    if(parent_file.isFolder) {
      // Search through all files to find the children of this folder
      for (let k = 0; k < all_files.length; k++) {
        let file = all_files[k];

        if (file.parents && file.parents.includes(parent_file.id)) {
          // Create a list of permission objects
          let permissions = !file.permissions ? [] : file.permissions.map(p => {
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
          });

          parent_file.content.push(file_object);

          // We've added it to one of its parents,
          // so check if we can remove it from all files
          file.parents_length -= 1;
          if (file.parents_length == 0) all_files.splice(k, 1);
        }
      }

      // Now, populate any subfolders we just found
      populateSubfolders(parent_file.content, all_files, current_path + parent_file.name + '/');
    }
  }
}