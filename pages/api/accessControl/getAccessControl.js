import { getToken } from "next-auth/jwt";
import User from "../../../lib/models/User";
import AccessControl from "../../../lib/models/AccessControl";

export default async function getAccessControl(req, res) {
    const token = await getToken({ req });
    if (token) {
        const userId = token.user.id;
        const user = await User.findOne({ id: userId });
        const accessControls = await AccessControl.find({ userId: user._id });
        console.log(accessControls);
        res.json({ accessControl: accessControls });
    } else {
        res.end("Not signed in or not a POST request.");
    }
}
