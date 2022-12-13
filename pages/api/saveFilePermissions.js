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

    //console.log(permission);

    let flag = false;// This flag is to manipulate error and non error res.json statements

    //%%%%%%%%%%%%%%%%%%%%%%%
    //Adding a new permission
    //%%%%%%%%%%%%%%%%%%%%%%%

    if(req.body.permission[0] =="add permission"){
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
    }

    //let permissions = file.permissions;
    //permissions[permission_index] = permission;
    
    //file.permissions = file.permissions.push(permission);

    // save updated permissions file
    //let saved_file = await file.save();
    //console.log(saved_file);
    //console.log(req.body.permission);
    if(flag == false){
      res.json({ permission: permission });
    }
  } else {
    res.end("Not signed in or not a POST request.");
  }
}
