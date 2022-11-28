import axios from "axios";
import { getToken } from "next-auth/jwt";
import User from "../../lib/models/User";
import File from "../../lib/models/File";
import Permission from "../../lib/models/Permission";
import Snapshot from "../../lib/models/Snapshot";

const apiUrl = "https://graph.microsoft.com/v1.0";
let options;

export default async function takeOneDriveSnapshot(req, res) {
  const token = await getToken({ req });
  if (token && req.method === "POST") {
    options = {
      headers: {
        authorization: `Bearer ${token.accessToken}`,
      },
    };

    const top_level_files = [];
    await populateSubfolders(top_level_files, "root", "");
    // Save snapshot to database
    const user = await User.findOne({ id: token.user.id });
    const snapshot = new Snapshot({
      date: new Date().toString(),
      user: user.email,
      files: top_level_files,
      provider: "microsoft",
    });

    // Add this snapshot to the user profile
    const saved_snapshot = await snapshot.save();
    const snapshotId = saved_snapshot._id.toString();
    user.snapshotIDs.unshift(snapshotId);
    await user.save();

    res.json({ id: snapshotId });
  } else {
    res.end("Invalid authentication to take a snapshot.");
  }
}

// Parse files to have the same fields as Google Drive for simplification
async function populateSubfolders(parentContents, folderId, path) {
  const res = await axios.get(
    `${apiUrl}/me/drive/items/${folderId}/children?$expand=thumbnails`,
    options
  );
  console.log("Thumbnails worked!");
  const rawFiles = res.data.value;
  console.log(rawFiles);

  for (let file of rawFiles) {
    const permsRes = await axios.get(
      `${apiUrl}/me/drive/items/${file.id}/permissions`,
      options
    );
    const perms = permsRes.data.value;

    // I believe the last permission is always the owner permission?
    const ownerPerm = perms.at(-1);
    const owner = ownerPerm.grantedToV2.user;
    const owners = [
      {
        displayName: owner.displayName,
        permissionId: ownerPerm.id,
        emailAddress: owner.email,
        photoLink: "https://i.imgur.com/4FhvzzY.jpg", // Blank avatar,
      },
    ];

    const mimeType = file.file ? file.file.mimeType : "folder";
    const newPath = `${path}/${file.name}`;
    const file_obj = new File({
      id: file.id,
      name: file.name,
      mimeType: mimeType,
      isFolder: mimeType === "folder",
      modifiedTime: file.lastModifiedDateTime,
      path: newPath,
      // parents: undefined, // Not sure "parents" attribute is necessary.
      thumbnailLink:
        file.thumbnails.length > 0
          ? file.thumbnails[0].medium.url
          : "https://i.imgur.com/6QSVYLRm.jpg",
      // owners: owners,
      // driveId: doesn't apply?,
      driveName: "MyDrive",
      // permissions: perms,
      content:
        mimeType === "folder"
          ? await populateSubfolders([], file.id, newPath)
          : [],
    });
    parentContents.push(file_obj);
  }

  return parentContents;
}
