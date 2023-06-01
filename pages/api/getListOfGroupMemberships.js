import { getToken } from "next-auth/jwt";
import GroupSnapshot from "../../lib/models/GroupSnapshot";

export default async function getListOfGroupMemberships(req, res) {
  const token = await getToken({ req });
  if (token) {
    let list_of_ids = req.body.id_list;
    let list_of_snapshots = await GroupSnapshot.find({ '_id': { $in: list_of_ids } });
    res.json(list_of_snapshots);
  } else {
    res.end("Invalid session.");
  }
}
