import { getToken } from "next-auth/jwt";
import User from "../../lib/models/User";
import Permission from "../../lib/models/Permission";
import File from "../../lib/models/File";
import { drive, drive_v3 } from "googleapis/build/src/apis/drive";
import { google } from "googleapis";


const auth = new google.auth.OAuth2({
  client_id: process.env.GOOGLE_ID,
  client_secret: process.env.GOOGLE_SECRET,
});


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
          fields: 'webViewLink'
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
          });
        }
        catch(err){
          flag = true;
          res.json("Bad Request");
        }
        if(flag == false){
          res.json({ permissionId: permissionId });
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
}
