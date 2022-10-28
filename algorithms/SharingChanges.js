import axios from 'axios';

export default async function AnalyzeSharingChanges(first_snapshot_id, second_snapshot_id, path, drive) {
  console.log('Analyzing snapshots for sharing changes...');
  let first_snapshot = await axios.get('/api/getSnapshot', {
      params: { id: first_snapshot_id }
  });
  let second_snapshot = await axios.get('/api/getSnapshot', {
    params: { id: second_snapshot_id }
  });
  let first_files = first_snapshot.data.files;
  let second_files = second_snapshot.data.files;

  path = path ? path : '/';
  path = (path === '' ? '/' : path);
  if (path.charAt(0) !== '/')
    path = '/' + path;

  // Results will be an array of objects describing the deviant files
  let result = [];
  AnalyzeSharingChangesAlgo(first_files, second_files, path, drive, result, first_snapshot_id, second_snapshot_id);
  return result;
}

function AnalyzeSharingChangesAlgo(first_files, second_files, path, drive, result, first_snapshot_id, second_snapshot_id) {
  let first_all = [];
  addAllFiles(first_files, first_all, path, drive);
  
  let second_all = [];
  addAllFiles(second_files, second_all, path, drive);

  let first_all_ids = [];
  for (let first_file of first_all)
    first_all_ids.push(first_file.id);

  let second_all_ids = [];
  for (let second_file of second_all)
      second_all_ids.push(second_file.id);

  let shared_ids = first_all_ids.filter(x => second_all_ids.includes(x));
  let new_ids = second_all_ids.filter(x => !first_all_ids.includes(x));

  // For each shared file: 
  const jsonReplacer = ['email', 'type', 'role', 'domain'];
  for (let shared_id of shared_ids) {
    let first_shared_file_index = first_all_ids.indexOf(shared_id);
    let second_shared_file_index = second_all_ids.indexOf(shared_id);

    let first_shared_file = first_all[first_shared_file_index];
    let second_shared_file = second_all[second_shared_file_index];

    // Get perms of both as array of strings
    let first_perms_str = [];
    for (let first_perm of first_shared_file.permissions)
      first_perms_str.push(JSON.stringify(first_perm, jsonReplacer));

    let second_perms_str = []
    for (let second_perm of second_shared_file.permissions)
      second_perms_str.push(JSON.stringify(second_perm, jsonReplacer));

    if (JSON.stringify(second_perms_str) !== JSON.stringify(first_perms_str)) {
      // get the perms in both the folder and the subfile
      let shared_perms = first_perms_str.filter(x => second_perms_str.includes(x));

      // get the perms the subfile has but not the folder
      let new_perms = second_perms_str.filter(x => !shared_perms.includes(x));

      // get the perms the folder has but not the subfile
      // should always be empty, since children inherit perms from parents
      let deleted_perms = first_perms_str.filter(x => !shared_perms.includes(x));

      let result_obj = {
        type: 'updated', 
        file: first_shared_file.name, 
        new_perms: new_perms, 
        deleted_perms: deleted_perms,
        first_snapshot_perms: first_perms_str, 
        second_snapshot_perms: second_perms_str,
        first_snapshot_id: first_snapshot_id, 
        second_snapshot_id: second_snapshot_id
      };
      result.push(result_obj);
    }
  }

  // for new files
  for (let new_id of new_ids) {
    let new_ids_index = second_all_ids.indexOf(new_id);
    let new_file = second_all[new_ids_index];

    let new_file_perms = [];
    for (let new_file_perm of new_file.permissions)
      new_file_perms.push(JSON.stringify(new_file_perm, jsonReplacer));

    let result_obj = {
      type: 'new', 
      file: new_file.name, 
      permissions: new_file_perms, 
      first_snapshot_id: first_snapshot_id, 
      second_snapshot_id: second_snapshot_id
    };
    result.push(result_obj);
  }
}

function addAllFiles(folder, all_files, path, drive) {
  for (let file of folder) {
    if (drive !== '' && file.driveName !== drive)
      continue;

    // if we are in the path, add this file to the list to be analyzed
    if (file.path.indexOf(path) === 0)
      all_files.push(file);

    if(file.isFolder)
      addAllFiles(file.content, all_files, path, drive);
  }
}
