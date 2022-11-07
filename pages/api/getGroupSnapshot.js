import { getToken } from 'next-auth/jwt';
import GroupSnapshot from '../../lib/models/GroupSnapshot';

export default async function getGroupSnapshot(req, res) {
  const token = await getToken({ req });
  if (token) {
    let groupSnapshotID = req.query.id;
    let groupSnapshot = await GroupSnapshot.findById(groupSnapshotID).lean();
    res.json(groupSnapshot);
  } else {
    res.end('Invalid session.');
  }
}