import { getToken } from "next-auth/jwt";
import User from "../../lib/models/User";
import GroupSnapshot from "../../lib/models/GroupSnapshot";

export default async function takeGroupSnapshot(req, res) {
  const token = await getToken({ req });
  if (token && req.method === "POST") {
    // Save snapshot to database
    let userId = token.user.id;
    let user = await User.findOne({ id: userId });
    let group_snapshot = new GroupSnapshot({
      groupName: req.body.groupName,
      groupEmail: req.body.groupEmail,
      timestamp: req.body.timestamp,
      user: user.email,
      members: req.body.members,
    });

    // Add this snapshot to the user profile
    let saved_snapshot = await group_snapshot.save();
    let snapshot_info = {id: saved_snapshot._id.toString(), email: saved_snapshot.groupEmail, timestamp: saved_snapshot.timestamp}
    user.groupSnapshotInfo.unshift(snapshot_info);
    await user.save();

    res.json({ info: snapshot_info });
    console.log("Succesfully saved group snapshot.");
  } else {
    res.end("Not signed in or not a POST request.");
  }
}
