import lodash from 'lodash';
import { getToken } from 'next-auth/jwt';
import Snapshot from '../../lib/models/Snapshot';

const queryOperator = {
  'drive': 'driveName',
  'owner': 'owners',
  'creator': 'user', // TODO:Check Where We can get this key
  'from': 'sharingUser',
  'to': 'user',
  'readable': 'user',
  'writable': 'user',
  'sharable': 'user',
  'name': 'regexp',
  'inFolder': 'regexp',
  'folder': 'regexp',
  'path': 'path',
  'sharing': 'none',
  'sharing': 'anyone',
  'sharing': 'individual',
  'sharing': 'domain',
  'foldersonly': 'true'
}

export default async function getSnapshot(req, res) {
  const token = await getToken({ req });
  if (token) {
    const snapshotId = req.query.id;
    const searchFor = req.query.query;
    const snapshot = await Snapshot.findById(snapshotId);
    const filteredResults = await searchSnapshot(snapshot.files , searchFor);
    res.json(filteredResults);
  } else {
    res.end('Invalid session.');
  }
}

const searchSnapshot = (files, query) => {
  const splitQuery = query.split(':');
  let searchForKeywords = query;
  let fieldTofetch = 'name';

  if (splitQuery.length > 0) {
    if (Object.keys(queryOperator).includes(splitQuery[0])) {
      fieldTofetch = queryOperator[splitQuery[0]];
      searchForKeywords = splitQuery[1];
    }
  }

  if (query === '' || searchForKeywords === '')
    return files;

  let searchedFiles = [];
  if (splitQuery[0] === 'owner' || splitQuery[0] === 'from' ){
    searchedFiles = files.filter((file) => {
      const fileDetails = file[fieldTofetch];
      let matchedDetails = [];
      if (Array.isArray(fileDetails)) {
        matchedDetails = lodash.filter((fileDetails, detail) => {
          console.log(detail);
          if (detail.displayName.toLowerCase().search(searchForKeywords.toLowerCase()) !== -1)
            return detail;
        });

        if (matchedDetails.length > 0)
          return file;
      } else {
        if (fileDetails) {
          console.log(fileDetails);
          if (fileDetails?.displayName.toLowerCase().search(searchForKeywords.toLowerCase()) !== -1)
            return file;
        }
      }
    });
  } else {
    searchedFiles = files.filter((file) => {
      const fileName = file[fieldTofetch].toLowerCase();
      if (fileName.search(searchForKeywords.toLowerCase()) !== -1)
        return file;
    });
  }
    
  return searchedFiles;
}