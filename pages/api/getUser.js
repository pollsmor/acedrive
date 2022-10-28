import { getToken } from 'next-auth/jwt';
import User from '../../lib/models/User';

export default async function getUser(req, res) {
  const token = await getToken({ req });
  if (token) {
    let userId = token.user.id;
    let user = await User.findOne({ id: userId }).lean();
    res.json(user);
  } else {
    res.end('Invalid session.');
  }
}