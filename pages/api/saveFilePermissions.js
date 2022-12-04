import { getToken } from "next-auth/jwt";
import User from "../../lib/models/User";
import Permission from "../../lib/models/Permission";
import File from "../../lib/models/File";

export default async function saveSearchQuery(req, res) {
  const token = await getToken({ req });
  if (token && req.method === "POST") {
    let userId = token.user.id;
    let user = await User.findOne({ id: userId });
    let file = req.body.file;
    let permission_index = req.body.permissionIndex;

    let permission = new Permission({
      email: req.body.email,
      type: req.body.type, // Who this applies to (user, group, domain, etc)
      role: req.body.role, // Is "reader", "writer", or "owner"
      domain: req.body.domain,
      permissionDetails: req.body.permissionDetails,
      isInherited: req.body.isInherited,
      //do we add permissionId here?
    });

    let permissions = file.permissions;
    permissions[permission_index] = permission;
    
    file.permissions = permissions;

    // save updated permissions file
    let saved_file = await file.save();
    console.log(saved_file);
  } else {
    res.end("Not signed in or not a POST request.");
  }
}
