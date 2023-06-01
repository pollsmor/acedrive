import { getToken } from "next-auth/jwt";
import User from "../../../lib/models/User";
import AccessControl from "../../../lib/models/AccessControl";

export default async function getAccessControl(req, res) {
    const token = await getToken({ req });
    if (token && req.method === "POST") {
        const accessControlId = req.body.accessId;
        const accessControls = await AccessControl.deleteOne({
            _id: accessControlId,
        });
        console.log(accessControls);
        res.json({ message: "Successfully Deleted" });
    } else {
        res.end("Not signed in or not a POST request.");
    }
}
