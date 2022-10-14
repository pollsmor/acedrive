import { getToken } from 'next-auth/jwt';
import User from '../../lib/models/User';

export default async function handler(req, res) {
  const token = await getToken({ req });
  if (token && req.method === 'POST') {
    let userId = token.user.id;
    let user = await User.findOne({ id: userId }).lean();
    res.json(user);
  } else {
    res.end('Not signed in or not a POST request.');
  }
}