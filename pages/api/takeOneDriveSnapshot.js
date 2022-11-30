import axios from "axios";
import { getToken } from "next-auth/jwt";
import User from "../../lib/models/User";
import File from "../../lib/models/File";
import Permission from "../../lib/models/Permission";
import Snapshot from "../../lib/models/Snapshot";

const blankAvatarUrl = "https://i.imgur.com/4FhvzzY.jpg";
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

    // Handle normal files in your drive
    const personal_files = [];
    await populateSubfolders(personal_files, "root", "");

    // Handle shared files
    const shared_files = [];
    const remoteRes = await axios.get(
      `${apiUrl}/me/drive/sharedWithMe`,
      options
    );
    const remoteFiles = remoteRes.data.value;
    for (const file of remoteFiles) {
      const remoteDriveId = file.remoteItem.parentReference.driveId;
      const remoteItemId = file.remoteItem.id;
      if (remoteItemId === "01ARVPJVBTOTUUPAAANNBKJZIJEC5NW4SF")
        continue; // Bugged "Documents" folder in shared files section

      shared_files.push(
        await parseRemoteItem(remoteDriveId, remoteItemId, `/${file.name}`)
      );
    }

    // Save snapshot to database
    const user = await User.findOne({ id: token.user.id });
    const snapshot = new Snapshot({
      date: new Date().toString(),
      user: user.email,
      files: personal_files.concat(shared_files),
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
  const rawFiles = res.data.value;

  for (let file of rawFiles) {
    const permsRes = await axios.get(
      `${apiUrl}/me/drive/items/${file.id}/permissions`,
      options
    );
    const rawPerms = permsRes.data.value;

    let owners = []; // Owner is unknown if you do not own the file - keep blank.
    const parsedPerms = [];
    for (const perm of rawPerms) {
      let role = "reader"; // Default
      switch (perm.roles[0]) {
        case "owner":
          role = "owner";
          break;
        case "write":
          break;
          role = "writer";
          break;
      }

      // Not all permissions have this.
      if ("grantedToV2" in perm) {
        const user = perm.grantedToV2.user;
        if (role === "owner") {
          owners.push({
            displayName: user.displayName,
            permissionId: perm.id,
            emailAddress: user.email,
            photoLink: blankAvatarUrl,
          });
        }

        parsedPerms.push(
          new Permission({
            email: user.email,
            type: "user", // Assumption for now
            role: role,
            isInherited: false, // Assumption for now
          })
        );
      }

      // In link sharing permissions, a "grantedToIdentities" attribute with a list of users is returned.
      if ("grantedToIdentitiesV2" in perm) {
        for (const identity of perm.grantedToIdentitiesV2) {
          parsedPerms.push(
            new Permission({
              email: identity.user.email,
              type: "user", // Assumption for now
              role: role,
              isInherited: false, // Assumption for now
            })
          );
        }
      }
    }

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
          : "https://i.imgur.com/6QSVYLRm.jpg", // Generic file thumbnail
      owners: owners,
      creator: file.createdBy.user.email,
      // driveId: doesn't apply?,
      driveName: "MyDrive",
      permissions: parsedPerms,
      content:
        mimeType === "folder"
          ? await populateSubfolders([], file.id, newPath)
          : [],
    });
    parentContents.push(file_obj);
  }

  return parentContents;
}

// Slower to request every file one by one, but eliminates code repetition
async function parseRemoteItem(driveId, itemId, path) {
  const itemRes = await axios.get(
    `${apiUrl}/drives/${driveId}/items/${itemId}`,
    options
  );
  const file = itemRes.data;

  const content = [];
  if (file.folder) {
    const childrenRes = await axios.get(
      `${apiUrl}/drives/${driveId}/items/${itemId}/children`,
      options
    );

    const children = childrenRes.data.value;
    for (let child of children) {
      const newPath = `${path}/${child.name}`;
      content.push(
        await parseRemoteItem(driveId, child.id, newPath)
      );
    }
  }

  const mimeType = file.file ? file.file.mimeType : "folder";

  return new File({
    id: file.id,
    name: file.name,
    mimeType: mimeType,
    isFolder: mimeType === "folder",
    modifiedTime: file.lastModifiedDateTime,
    path: path,
    // parents: undefined, // Not sure "parents" attribute is necessary.
    thumbnailLink: "https://i.imgur.com/6QSVYLRm.jpg", // Generic file thumbnail
    owners: [], // Can't confirm for shared item, I believe
    creator: file.createdBy.user.email,
    driveId: driveId,
    driveName: "Shared", // Can't find in OneDrive API
    permissions: [],
    content: content,
  });
}
