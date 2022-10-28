import { getToken } from 'next-auth/jwt';
import Snapshot from '../../lib/models/Snapshot';

export default async function getSnapshot(req, res) {
  const token = await getToken({ req });
  if (token) {
    let snapshot_id = req.query.id;
    let snapshot = await Snapshot.findById(snapshot_id).lean();
    res.json(snapshot);
  } else {
    res.end('Invalid session.');
  }
}