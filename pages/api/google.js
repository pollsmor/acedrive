import { google } from 'googleapis';
import { getToken } from 'next-auth/jwt';

const auth = new google.auth.OAuth2({
  client_id: process.env.GOOGLE_ID,
  client_secret: process.env.GOOGLE_SECRET
});
const drive = google.drive({ auth, version: 'v3' });

export default async function handler(req, res) {
  const token = await getToken({ req });
  if (token && req.method === 'POST') {
    auth.setCredentials({
      access_token: req.body.accessToken
    });

    let googleRes = await drive.files.list({
      q: `mimeType=\'image/jpeg\'`
    });
    res.json({ files: googleRes.data.files})
  } else {
    res.end('Not signed in or not a POST request.');
  }
}