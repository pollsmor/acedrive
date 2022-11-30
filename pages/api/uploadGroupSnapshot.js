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
      date: req.body.timestamp,
      user: user.email,
      members: req.body.members,
    });

    // Add this snapshot to the user profile
    let saved_snapshot = await group_snapshot.save();
    let snapshot_id = saved_snapshot._id.toString();
    user.groupSnapshotIDs.unshift(snapshot_id);
    await user.save();

    res.json({ id: snapshot_id });
    console.log("Succesfully saved group snapshot.");
  } else {
    res.end("Not signed in or not a POST request.");
  }
}
