import { getToken } from "next-auth/jwt";
import Snapshot from "../../lib/models/Snapshot";
import GroupSnapshot from "../../lib/models/GroupSnapshot";

export default async function getSnapshot(req, res) {
  const token = await getToken({ req });
  if (token) {
    let snapshotId = req.query.id;
    if (req.query.isGroupSnapshot) {
      let snapshot = await GroupSnapshot.findById(snapshotId).lean();
      res.json(snapshot);
    } else {
      let snapshot = await Snapshot.findById(snapshotId).lean();
      if (token.provider === snapshot.provider) {
        res.json(snapshot);
      } else res.end('Given provider does not match snapshot provider.');
    }
  } else {
    res.end("Invalid session.");
  }
}
