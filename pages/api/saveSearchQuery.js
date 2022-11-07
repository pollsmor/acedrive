import { getToken } from 'next-auth/jwt';
import User from '../../lib/models/User';

export default async function saveSearchQuery(req, res) {
  const token = await getToken({ req });
  if (token && req.method === 'POST') {
    let userId = token.user.id;
    let user = await User.findOne({ id: userId });

    // Add the query to the user's profile
    user.queries.unshift(req.body.query);
    await user.save();
    res.end('Successfully saved query.');
  } else {
    res.end('Not signed in or not a POST request.');
  }
}