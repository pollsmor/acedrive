import axios from 'axios';

export default async function AnalyzeFileFolderDifferences(snapshot_id, path, drive) {
    console.log('Analyzing snapshot for file-folder differences...');
    let snapshot = await axios.get('/api/getSnapshot', {
      params: { id: snapshot_id }
    });
    let files = snapshot.data.files;
    path = (path === '' ? '/' : path);
    if (path.charAt(0) !== '/')
      path = '/' + path;

    // Results will be an array of objects describing the deviant files
    let result = [];
    AnalyzeFileFolderDifferencesAlgo(files, path, drive, result);
    return result;
}

function AnalyzeFileFolderDifferencesAlgo(files, path, drive, result) {
  // For every file in this folder
  for (let parent_file of files) {
    // If there is a drive condition, and this file isn't in that drive, skip it
    if (drive !== '' && parent_file.driveName !== drive)
      continue;
    
    // If this is a folder, go through and find differences between its permission and the permission of all of its children
    if (parent_file.mimeType === 'application/vnd.google-apps.folder') {
      // If we aren't IN the path yet, we don't want to analyze this folder itself
      if (parent_file.path.indexOf(path) !== 0) {    
        console.log(`Skipping analysis on file contents of ${parent_file.path}`);
        // Subdirectory might be path though, so continue DFS
        AnalyzeFileFolderDifferencesAlgo(parent_file.content, path, drive, result);
        continue;
      }

      console.log(`Analyzing file contents of ${parent_file.path}...`);
      // file.permissions is an array of objects
      // We will convert to an array of strings for easier comparison/manipulation
      let parent_permissions = [];
      for (let object of parent_file.permissions) {
        // Make sure we don't include permission object ID's in the string - they are always unique
        parent_permissions.push(JSON.stringify(object, ['email', 'type', 'role', 'domain']));
      } 

      let parent_perms_string = JSON.stringify(parent_permissions);

      // Now get the same permissions string for each child, and compare
      for (let subfile of parent_file.content) {
        let subfile_permissions = [];
        for (let object of subfile.permissions) {
            // Make sure we don't include permission object ID's in the string - they are always unique
            subfile_permissions.push(JSON.stringify(object, ['email', 'type', 'role', 'domain']));
        } 

        let subfile_perms_string = JSON.stringify(subfile_permissions);

        // put all file-folder differences into result
        if (parent_perms_string !== subfile_perms_string) {
          // get the perms in both the folder and the subfile
          let shared_perms = subfile_permissions.filter(x => parent_permissions.includes(x));

          // get the perms the subfile has but not the folder
          let extra_perms = subfile_permissions.filter(x => !shared_perms.includes(x));

          // get the perms the folder has but not the subfile
          // should always be empty, since children inherit perms from parents
          let missing_perms = parent_permissions.filter(x => !shared_perms.includes(x));

          let result_obj = {
            file: subfile.name, 
            parent: parent_file.name, 
            file_perms: subfile_permissions, 
            parent_perms: parent_permissions,
            extra: extra_perms, 
            missing: missing_perms
          };
          result.push(result_obj);
        }
      }

      AnalyzeFileFolderDifferencesAlgo(parent_file.content, path, drive, result);
    }
  }
}