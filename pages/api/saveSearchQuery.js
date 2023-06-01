import { getToken } from "next-auth/jwt";
import User from "../../lib/models/User";

export default async function saveSearchQuery(req, res) {
  const token = await getToken({ req });
  if (token && req.method === "POST") {
    let userId = token.user.id;
    let user = await User.findOne({ id: userId });

    if (!user.queries.includes(req.body.query)) {
      // Add the query to the user's profile
      console.log("Saved");
      user.queries.unshift(req.body.query);
      user.queries = user.queries.slice(0,5)
      await user.save();
    }
    
    const updatedUser = await User.findOne({ id: userId });
    res.json({ queries: updatedUser.queries });
  } else {
    res.end("Not signed in or not a POST request.");
  }
}
