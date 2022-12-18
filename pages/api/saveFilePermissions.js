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
  
        //Further examination for below fields is necessary
        //domain: req.body.domain,
        //permissionDetails: req.body.permissionDetails,
        //isInherited: req.body.isInherited,
        //do we add permissionId here?
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
          res.json({ permission: permission });
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
          res.json({ permission: permission });
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
          res.json({ permission: permission });
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
}
