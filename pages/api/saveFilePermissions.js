import { getToken } from "next-auth/jwt";
import User from "../../lib/models/User";
import Permission from "../../lib/models/Permission";
import File from "../../lib/models/File";
import { drive, drive_v3 } from "googleapis/build/src/apis/drive";
import { google } from "googleapis";
import Snapshot from "../../lib/models/Snapshot";



const auth = new google.auth.OAuth2({
  client_id: process.env.GOOGLE_ID,
  client_secret: process.env.GOOGLE_SECRET,
});

const fields = [
  "id",
  "name",
  "mimeType",
  "parents",
  "thumbnailLink",
  "modifiedTime",
  "sharingUser",
  "owners",
  "permissions",
  "driveId",
];

let successfulChanges=[];//this list will hold permissions for a file that were changed. 


export default async function saveFilePermissions(req, res) {
  
  const token = await getToken({ req });
  if (token && req.method === "POST") {
    auth.setCredentials({
      access_token: token.accessToken,
    });
  }
  const drive = google.drive({ auth, version: "v3" });
  if (token && req.method === "POST") {
    let userId = token.user.id;
    let user = await User.findOne({ id: userId });
    let file = req.body.file;


    //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    //Editing permissions
    //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

    if(req.body.permission[0] =="permission edits"){
      var successList = [];//To record which permissions were updated successfully
      var failureList = [];//To record which permissions had unsuccessful updation
      const editedPermissionsList = req.body.editedPermissionsList;
      //Start of loop going through editedPermissionsList
      editedPermissionsList.map(async (e)=>{
        let successFlag = true;
        const permission = e[0];//permission object
        const role = e[1];//desired role
        const permissionId = permission.permissionId;//permissionId
        var fileId = req.body.file.id;//file id
        //now we need a special case for type 'owner'
        if(role === "owner" && permission.type ==="user"/*&& check for if owner here is not previous owner*/ ){
          try{
            const result =  await drive.permissions.update({
              fileId: file,
              permissionId: permissionId,
              transferOwnership: true,
              supportsAllDrives: true,
              resource: {
                role: role, //String
              }
            });
          }
          catch(err){
            successFlag = false;
            failureList.push(permission);
          }
        }//end of ownership transfer special case
        else{
          try{
            const result =  drive.permissions.update({
              fileId: fileId,
              permissionId: permissionId,
              supportsAllDrives: true,
              resource: {
                role: role, //String
              }
            });
          }
          catch(err){
            successFlag = false;
            failureList.push(permission);
          }
        }
        if(successFlag){
          permission.role = role;// setting this value to role so alert later can display right values for success
          successList.push(permission);
        }
      });//end of loop going through editedPermissionsList
      res.json({successList: successList, failureList: failureList});
    }

    //req.body.permission looks like -> [add permission, email, type, role, fileId]

    //console.log(permission);

    let flag = false;// This flag is to manipulate error and non error res.json statements

    //%%%%%%%%%%%%%%%%%%%%%%%
    //Copying web Link
    //%%%%%%%%%%%%%%%%%%%%%%%

    if(req.body.permission[0] =="get link"){
      var fileId = req.body.file.id;
      let webViewLink = "";
      try{
          webViewLink = await drive.files.get({
          fileId: fileId,
          fields: 'webViewLink',
          supportsAllDrives: true
        });
      }
      catch(err){
        flag = true;
        res.json("Bad Request");
      }
      if(flag == false){
        res.json({ webViewLink: webViewLink });
      }
    }

    //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    //Adding a new permission for 'user'/'group'
    //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

    if(req.body.permission[0] =="add permission"){
      const permission = new Permission({
        email: req.body.permission[1],
        type: req.body.permission[2], // Who this applies to (user, group, domain, etc)
        role: req.body.permission[3], // Is "reader", "writer", or "owner"
      });
      var fileId = req.body.file.id;
      let email = req.body.permission[1];
      let role = req.body.permission[3];
      let type = req.body.permission[2];

      //creating new permission in drive
      try{
          const result = await drive.permissions.create({
            fileId: fileId,
            supportsAllDrives: true,
            resource: {
              role: role, //String
              type: type, //String
              emailAddress: email,
            }
          });
        }
        catch(err){
          flag = true;
          res.json("Bad Request");
        }
        if(flag == false){
          //from takeGDriveSnapshot.js********* This is to list files 
          //
          let googleRes = await drive.files.list({
            //fields: '*', // Retrieve all fields - useful for testing
            fields: `files(${fields.join(",")}), nextPageToken`,
            includeItemsFromAllDrives: true,
            supportsAllDrives: true,
          });
      
          let nextpage = googleRes.data.nextPageToken;
          let files = googleRes.data.files;

          // Continue pagination as long as next page token exists
          while (nextpage) {
            googleRes = await drive.files.list({
              //fields: '*', // Retrieve all fields - useful for testing
              fields: `files(${fields.join(",")}), nextPageToken`,
              pageToken: nextpage,
              includeItemsFromAllDrives: true,
              supportsAllDrives: true,
            });

            nextpage = googleRes.data.nextPageToken;
            // Append to list of files from previous pages
            files = files.concat(googleRes.data.files);
          }
          // Root will always alias to the root of the drive, but we want to know its actual id
          // so that we can identify top level folders for easier parsing
          let rootRes = await drive.files.get({ fileId: "root" });
          let root_id = rootRes.data.id;

          // Many fields aren't populated, so we will go through and populate them
          await populateMissingFields(files, root_id);

          // Files are currently just a list of everything, we want to
          // parse that into a data structure to allow for easier analysis/search
          let file_data_structure = parseFiles(files);

          //above from takeGDriveSnapshot.js********* This is to list files 
          //
          
          let userId = token.user.id;
          let user = await User.findOne({ id: userId });
          let currentSnapshotId = user.snapshotIDs.shift();//current snapshotId
          let currentSnapshot = await Snapshot.findById(currentSnapshotId);
          await Snapshot.updateOne(currentSnapshot, { $set: { files: file_data_structure } });
          user.snapshotIDs.unshift(currentSnapshotId);//re enter the snapshotid into snapshot ids
          await user.save();
          res.json({currentSnapshotId : currentSnapshotId});
        }
    }

    //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    //Adding a new permission for type anyone
    //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

    if(req.body.permission[0] =="add permission anyone"){
      const permission = new Permission({
        type: req.body.permission[2], // Who this applies to (user, group, domain, etc)
        role: req.body.permission[3], // Is "reader", "writer", or "owner"
  
        //Further examination for below fields is necessary
        //domain: req.body.domain,
        //permissionDetails: req.body.permissionDetails,
        //isInherited: req.body.isInherited,
        //do we add permissionId here?
      });
      var fileId = req.body.file.id;
      let role = req.body.permission[3];
      let type = req.body.permission[2];

      //creating new permission in drive
      try{
          const result = await drive.permissions.create({
            fileId: fileId,
            supportsAllDrives: true,
            resource: {
              role: role, //String
              type: type, //String
            }
          });
        }
        catch(err){
          flag = true;
          res.json("Bad Request");
        }
        if(flag == false){
          //from takeGDriveSnapshot.js********* This is to list files 
          //
          let googleRes = await drive.files.list({
            //fields: '*', // Retrieve all fields - useful for testing
            fields: `files(${fields.join(",")}), nextPageToken`,
            includeItemsFromAllDrives: true,
            supportsAllDrives: true,
          });
      
          let nextpage = googleRes.data.nextPageToken;
          let files = googleRes.data.files;

          // Continue pagination as long as next page token exists
          while (nextpage) {
            googleRes = await drive.files.list({
              //fields: '*', // Retrieve all fields - useful for testing
              fields: `files(${fields.join(",")}), nextPageToken`,
              pageToken: nextpage,
              includeItemsFromAllDrives: true,
              supportsAllDrives: true,
            });

            nextpage = googleRes.data.nextPageToken;
            // Append to list of files from previous pages
            files = files.concat(googleRes.data.files);
          }
          // Root will always alias to the root of the drive, but we want to know its actual id
          // so that we can identify top level folders for easier parsing
          let rootRes = await drive.files.get({ fileId: "root" });
          let root_id = rootRes.data.id;

          // Many fields aren't populated, so we will go through and populate them
          await populateMissingFields(files, root_id);

          // Files are currently just a list of everything, we want to
          // parse that into a data structure to allow for easier analysis/search
          let file_data_structure = parseFiles(files);

          //above from takeGDriveSnapshot.js********* This is to list files 
          //
          
          let userId = token.user.id;
          let user = await User.findOne({ id: userId });
          let currentSnapshotId = user.snapshotIDs.shift();//current snapshotId
          let currentSnapshot = await Snapshot.findById(currentSnapshotId);
          await Snapshot.updateOne(currentSnapshot, { $set: { files: file_data_structure } });
          user.snapshotIDs.unshift(currentSnapshotId);//re enter the snapshotid into snapshot ids
          await user.save();
          res.json({currentSnapshotId : currentSnapshotId});
          //res.json({ permission: permission });
        }
    }

    //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    //Adding a new permission for type domain
    //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

    if(req.body.permission[0] =="add permission domain"){
      const permission = new Permission({
        domain: req.body.permission[1],
        type: req.body.permission[2], // Who this applies to (user, group, domain, etc)
        role: req.body.permission[3], // Is "reader", "writer", or "owner"
  
        //Further examination for below fields is necessary
        //domain: req.body.domain,
        //permissionDetails: req.body.permissionDetails,
        //isInherited: req.body.isInherited,
        //do we add permissionId here?
      });
      var fileId = req.body.file.id;
      let domain = req.body.permission[1];
      let role = req.body.permission[3];
      let type = req.body.permission[2];

      //creating new permission in drive
      try{
          const result = await drive.permissions.create({
            fileId: fileId,
            supportsAllDrives: true,
            resource: {
              role: role, //String
              type: type, //String
              domain: domain, // domain is required for adding a permission of type 'domain'
            }
          });
        }
        catch(err){
          flag = true;
          res.json("Bad Request");
        }
        if(flag == false){
          //from takeGDriveSnapshot.js********* This is to list files 
          //
          let googleRes = await drive.files.list({
            //fields: '*', // Retrieve all fields - useful for testing
            fields: `files(${fields.join(",")}), nextPageToken`,
            includeItemsFromAllDrives: true,
            supportsAllDrives: true,
          });
      
          let nextpage = googleRes.data.nextPageToken;
          let files = googleRes.data.files;

          // Continue pagination as long as next page token exists
          while (nextpage) {
            googleRes = await drive.files.list({
              //fields: '*', // Retrieve all fields - useful for testing
              fields: `files(${fields.join(",")}), nextPageToken`,
              pageToken: nextpage,
              includeItemsFromAllDrives: true,
              supportsAllDrives: true,
            });

            nextpage = googleRes.data.nextPageToken;
            // Append to list of files from previous pages
            files = files.concat(googleRes.data.files);
          }
          // Root will always alias to the root of the drive, but we want to know its actual id
          // so that we can identify top level folders for easier parsing
          let rootRes = await drive.files.get({ fileId: "root" });
          let root_id = rootRes.data.id;

          // Many fields aren't populated, so we will go through and populate them
          await populateMissingFields(files, root_id);

          // Files are currently just a list of everything, we want to
          // parse that into a data structure to allow for easier analysis/search
          let file_data_structure = parseFiles(files);

          //above from takeGDriveSnapshot.js********* This is to list files 
          //
          
          let userId = token.user.id;
          let user = await User.findOne({ id: userId });
          let currentSnapshotId = user.snapshotIDs.shift();//current snapshotId
          let currentSnapshot = await Snapshot.findById(currentSnapshotId);
          await Snapshot.updateOne(currentSnapshot, { $set: { files: file_data_structure } });
          user.snapshotIDs.unshift(currentSnapshotId);//re enter the snapshotid into snapshot ids
          await user.save();
          res.json({currentSnapshotId : currentSnapshotId});
          //res.json({ permission: permission });
        }
    }

    //%%%%%%%%%%%%%%%%%%%%%%%
    //Removing a Permission
    //%%%%%%%%%%%%%%%%%%%%%%%

    if(req.body.permission[0] =="delete permission"){
      //we need fileId and permissionId to delete a permission
      var fileId = req.body.file.id;
      let permissionId = req.body.permission[2];

      //Deleting permission in drive

      try{
          const result = await drive.permissions.delete({
            fileId: fileId,
            permissionId: permissionId,
            supportsAllDrives: true,
          });
        }
        catch(err){
          flag = true;
          res.json("Bad Request");
        }
        if(flag == false){
          successfulChanges.push(permissionId);//inserting removed permId
          let userId = token.user.id;
          let user = await User.findOne({ id: userId });
          let currentSnapshotId = user.snapshotIDs.shift();//current snapshotId
          updateSnapshot(currentSnapshotId, file);
          ///res.json({ permissionId: permissionId });
          //response for redirection below
          
          //currentSnapshot.files = newFiles;//changing the file permissions for the snapshot
          user.snapshotIDs.unshift(currentSnapshotId);//re enter the snapshotid into snapshot ids
          await user.save();
          res.json({currentSnapshotId : currentSnapshotId});
        }
    }

    //let permissions = file.permissions;
    //permissions[permission_index] = permission;
    
    //file.permissions = file.permissions.push(permission);

    // save updated permissions file
    //let saved_file = await file.save();
    //console.log(saved_file);
    //console.log(req.body.permission);
  
  } else {
    res.end("Not signed in or not a POST request.");
  }

  //%%%%%%%%%%%%%%%%%%%%%%%%%
  //Updating Current Snapshot
  //%%%%%%%%%%%%%%%%%%%%%%%%%

  //we can add a function here to update current snapshot with our successful permissions
  async function updateSnapshot(currentSnapshotId, file){
    //we need to get the current snapshot here. iterate till we find the file that we changed permissions for
    //then make changes to the file structure's files for permisions of the file and its children if they inherit the 
    //permission. Then we need to save current snapshot to the database again.
    let currentSnapshot = await Snapshot.findById(currentSnapshotId);
    //finding the file in the currentSnapshot
    let snapshotFiles = currentSnapshot.files;
    let foundFileFolder = null;

    //if its a file and not a folder then we just need to change the perms of this file then save in snapshot
    //iterating through successfulChanges
    successfulChanges.forEach(permId=>{
      let fileFolderPermissions = file.permissions;
      let modifiedFileFolderPermissions = [];
      fileFolderPermissions.map((permission)=>{
        if(permission.permissionId == permId){
          //we don't add this permission
        }
        else{
          //we add this permission
          modifiedFileFolderPermissions.push(permission);
        }
      });
      // fileFolderPermissions = fileFolderPermissions.filter(permission =>{
      //   return (permission.permissionId!=permId && (permission.isInherited==true));
      // });
      fileFolderPermissions = modifiedFileFolderPermissions;
      //now fileFolderPermissions doesn't have the perm with permId that was in successfulChanges.
      //so we can change this fileFolder's permission objects list.
      file.permissions = fileFolderPermissions;
    });
    if(file.isFolder){
      //recursion for folder and its children
      updateFolderPyramid(file);
    }

    //now we need to save the changes to files in current snapshot
    //console.log(file);
    let updatedSnapshotFiles = snapshotFiles.map((f)=>{
      if(f.id === file.id){
        return file;
      }
      else{
        return f;
      }
    });
    await Snapshot.updateOne(currentSnapshot, { $set: { files: updatedSnapshotFiles } })
  }

  async function updateFolderPyramid(fileFolder){

    //first we remove the permission from fileFolder if the permission is there.
   
    successfulChanges.forEach(permId=>{
      let fileFolderPermissions = fileFolder.permissions;
      let modifiedFileFolderPermissions = [];
      fileFolderPermissions.map((permission)=>{
        if(permission.permissionId == permId && permission.isInherited){
          //we don't add this permission
        }
        else{
          //we add this permission
          modifiedFileFolderPermissions.push(permission);
        }
      });
      // fileFolderPermissions = fileFolderPermissions.filter(permission =>{
      //   return (permission.permissionId!=permId && (permission.isInherited==true));
      // });
      fileFolderPermissions = modifiedFileFolderPermissions;
      //console.log("Permisisons for file/folder: "+fileFolder+" are: "+fileFolderPermissions);
      //now fileFolderPermissions doesn't have the perm with permId that was in successfulChanges.
      //so we can change this fileFolder's permission objects list.
      fileFolder.permissions = fileFolderPermissions;
    });

    //now we need to recurse on every child that is not a file
    if(!fileFolder.isFolder){
      return;
    }
    else{
      //is folder
      fileFolder.content.forEach(f=>{
        updateFolderPyramid(f);//recurse for folders
        return;
      });
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
          try {
            let driveRes = await drive.drives.get({
              driveId: file.driveId,
              fields: "name",
              supportsAllDrives: true,
            });
            file.driveName = driveRes.data.name;
            driveIdToName.set(file.driveId, file.driveName);
          } catch (err) {
            // if we can't find this driveID, then its a drive we don't have access to
            file.driveName = "Unknown Drive";
            driveIdToName.set(file.driveId, "Unknown Drive");
          }
        }
  
        // Get permmissions
        let permRes = await drive.permissions.list({
          fileId: file.id,
          fields: "permissions(role,emailAddress,type,domain,id)",//id added here so we can retrieve permissionId
          supportsAllDrives: true,
        });
        file.permissions = permRes.data.permissions;
  
        // Set folder-related metadata
        file.isFolder = file.mimeType === "application/vnd.google-apps.folder";
        file.content = [];
  
        file.owners = []; // Set owners to empty
      } else {
        // Set driveId and driveName
        file.driveId = root_id;
        file.driveName = "MyDrive";
  
        // Set folder-related metadata
        file.isFolder = file.mimeType === "application/vnd.google-apps.folder";
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
      let permissions = !file.permissions
        ? []
        : file.permissions.map((p) => {
            return new Permission({
              email: p.emailAddress,
              role: p.role,
              type: p.type,
              domain: p.domain,
              permissionDetails: p.permissionDetails
                ? p.permissionDetails
                : undefined,
              isInherited: false, // top level file so shouldn't be inheriting perms from anywhere
              permissionId: p.id,// permissionId is set to p.id which we get in 
              //permRes which is the response we get earlier
            });
          });

      // Create a file object for this file, with the list of permissions as a field
      let file_object = new File({
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        isFolder: file.isFolder,
        modifiedTime: file.modifiedTime,
        path: "/" + file.name,
        parents: file.parents ? file.parents : undefined,
        thumbnailLink: file.thumbnailLink ? file.thumbnailLink : undefined,
        sharingUser: file.sharingUser ? file.sharingUser : undefined,
        owners: file.owners,
        driveId: file.driveId,
        driveName: file.driveName,
        permissions: permissions,
        content: file.content,
      });

      // Add it the array
      top_level_files.push(file_object);

      // We've added it to one of its parents,
      // so check if we can remove it from all files
      file.parents_length -= 1;
      if (file.parents_length == 0) {
        all_files.splice(i, 1);
        i--;
      }
    }
  }

  // now, populate all the subfolders of the top level folders, and recursively populate any other subfolders
  populateSubfolders(top_level_files, all_files, "/");
  return top_level_files;
}

function populateSubfolders(files_to_populate, all_files, current_path) {
  for (let parent_file of files_to_populate) {
    if (parent_file.isFolder) {
      // Search through all files to find the children of this folder
      for (let k = 0; k < all_files.length; k++) {
        let file = all_files[k];

        if (file.parents && file.parents.includes(parent_file.id)) {
          let parent_perms_strings = [];
          for (let perm of parent_file.permissions) {
            parent_perms_strings.push(
              JSON.stringify(perm, ["email", "type", "role", "domain", "permissionId"])//permissionId added
            );
          }
          // Create a list of permission objects
          let permissions = !file.permissions
            ? []
            : file.permissions.map((p) => {
                p.email = p.emailAddress;
                p.permissionId = p.id;//Setting permissionIds for subfolders and files
                let stringified_p = JSON.stringify(p, [
                  "email",
                  "type",
                  "role",
                  "domain",
                  "permissionId",//permissionId added for permission model
                ]);

                return new Permission({
                  email: p.emailAddress,
                  role: p.role,
                  type: p.type,
                  domain: p.domain,
                  permissionId: p.id,//permissionId being set
                  permissionDetails: p.permissionDetails
                    ? p.permissionDetails
                    : undefined,
                  isInherited: parent_perms_strings.includes(stringified_p)
                    ? true
                    : false,
                });
              });

          // add child to parent's content list
          let file_object = new File({
            id: file.id,
            name: file.name,
            mimeType: file.mimeType,
            isFolder: file.isFolder,
            modifiedTime: file.modifiedTime,
            path: current_path + parent_file.name + "/" + file.name,
            parents: file.parents ? file.parents : undefined,
            thumbnailLink: file.thumbnailLink ? file.thumbnailLink : undefined,
            sharingUser: file.sharingUser ? file.sharingUser : undefined,
            owners: file.owners,
            driveId: file.driveId,
            driveName: file.driveName,
            permissions: permissions,
            content: file.content,
          });

          parent_file.content.push(file_object);

          // We've added it to one of its parents,
          // so check if we can remove it from all files
          file.parents_length -= 1;
          if (file.parents_length == 0) {
            all_files.splice(k, 1);
            k--;
          }
        }
      }

      // Now, populate any subfolders we just found
      populateSubfolders(
        parent_file.content,
        all_files,
        current_path + parent_file.name + "/"
      );
    }
  }
}

  
}
