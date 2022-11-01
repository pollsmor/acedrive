import axios from 'axios';
import { getToken } from 'next-auth/jwt';

const apiUrl = 'https://graph.microsoft.com/v1.0';

export default async function getOneDriveFiles(req, res) {
  const token = await getToken({ req });
  if (token) {
    const options = {
      headers: { 
        authorization: `Bearer ${token.accessToken}` 
      }
    };

    let files = await axios.get(`${apiUrl}/me/drive/root/children`, options);
    files = files.data.value;

    for (let file of files) {
      let perms = await axios.get(`${apiUrl}/me/drive/items/${file.id}/permissions`, options);
      file.permissions = perms.data.value;
    }

    res.json(files);
  } else {
    res.end('Invalid session.');
  }
}