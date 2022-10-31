import oneDriveAPI from 'onedrive-api';
import { getToken } from 'next-auth/jwt';

export default async function getOneDriveFiles(req, res) {
  const token = await getToken({ req });
  if (token) {
    let files = await oneDriveAPI.items.listChildren({
      accessToken: token.accessToken,
      itemId: 'root',
      drive: 'me',
      driveId: ''
    });
    res.json(files.value);
  } else {
    res.end('Invalid session.');
  }
}