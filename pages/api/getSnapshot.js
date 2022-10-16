import Snapshot from '../../lib/models/Snapshot'

export default async function fetchSnapshot(req, res) {
    let snapshot_id = req.body.id
    let snapshot = await Snapshot.findById(snapshot_id)
    if(snapshot) { 
        res.json(snapshot)
    }
    else {
        res.end('Not signed in or not a POST request.');
    }
}