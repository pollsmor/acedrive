import { google } from 'googleapis';

const auth = new google.auth.OAuth2({
  client_id: process.env.GOOGLE_ID,
  client_secret: process.env.GOOGLE_SECRET
});
const drive = google.drive({ auth, version: 'v3' });

export default function handler(req, res) {
  return new Promise(resolve => {
    if (req.method === 'POST') {
      auth.setCredentials(req.body.token);

      drive.files.list().then(data => {
        res.json({ files: data.data.files });
        resolve();
      });
    } else {
      res.end('Only POST requests allowed.');
      resolve();
    }
  });
}