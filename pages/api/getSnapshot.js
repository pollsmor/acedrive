import Snapshot from '../../lib/models/Snapshot';

export default async function fetchSnapshot(req, res) {
  if (req.method === 'POST') {
    let snapshot_id = req.body.id;
    let snapshot = await Snapshot.findById(snapshot_id).lean();
    res.json(snapshot);
  } else {
    res.end('Not a POST request.');
  }
}