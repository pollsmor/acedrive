import { getToken } from "next-auth/jwt";
import User from "../../../lib/models/User";
import AccessControl from "../../../lib/models/AccessControl";

export default async function saveAccessControl(req, res) {
    const token = await getToken({ req });
    if (token && req.method === "POST") {
        const userId = token.user.id;
        const user = await User.findOne({ id: userId });
        console.log(req.body);
        const accessControl = await new AccessControl({
            searchQuery: req.body.searchQuery,
            accessControlQuery: req.body.accessControlQuery,
            userId: user._id,
        });
        await accessControl.save();
        res.json({ message: "Successfully Saved" });
    } else {
        res.end("Not signed in or not a POST request.");
    }
}
