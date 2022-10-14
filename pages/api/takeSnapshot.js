import { google } from 'googleapis';
import { getToken } from 'next-auth/jwt';
import User from '../../lib/models/User';
import File from '../../lib/models/File';
import Permission from '../../lib/models/Permission';

const auth = new google.auth.OAuth2({
  client_id: process.env.GOOGLE_ID,
  client_secret: process.env.GOOGLE_SECRET
});
const drive = google.drive({ auth, version: 'v3' });
const fields = [
  'id', 'name', 'mimeType', 'parents', 'webViewLink', 'iconLink', 'modifiedTime',
  'sharingUser', 'owners', 'teamDriveId', 'permissions'
];
// Note: there doesn't seem to be a way to see who created a file, only its owner.

export default async function handler(req, res) {
  const token = await getToken({ req });
  if (token && req.method === 'POST') {
    auth.setCredentials({
      access_token: req.body.accessToken
    });

    let googleRes = await drive.files.list({
      //fields: '*', // Retrieve all fields - useful for testing
      fields: `files(${fields.join(',')})`,
      pageSize: 100,
      query: req.body.query,
      includeItemsFromAllDrives: true,
      supportsAllDrives: true
    });

    // Save snapshot to database
    let userId = token.user.id;
    let user = await User.findOne({ id: userId });
    let snapshot = googleRes.data.files.map(f => {
      let permissions = f.permissions ? f.permissions.map(p => {
        return new Permission({
          email: p.emailAddress,
          role: p.role
        });
      }) : undefined;

      return new File({
        id: f.id,
        name: f.name,
        mimeType: f.mimeType,
        parent: f.parents ? f.parents[0] : undefined,
        webViewLink: f.webViewLink,
        iconLink: f.iconLink,
        modifiedTime: f.modifiedTime,
        sharingUser: f.sharingUser ? 
          f.sharingUser.emailAddress : undefined,
        owner: f.owners ? f.owners[0].emailAddress : undefined,
        teamDriveId: f.teamDriveId,
        permissions: permissions
      });
    });

    user.snapshots.unshift(snapshot);
    user.save();

    res.end('Hello world');
  } else {
    res.end('Not signed in or not a POST request.');
  }
}