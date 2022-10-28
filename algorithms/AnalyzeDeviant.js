import axios from 'axios';

export default async function AnalyzeDeviant(snapshot_id, path, drive, threshold) {
  console.log('Analyzing snapshot for deviant permissions...');
  let snapshot = await axios.get('/api/getSnapshot', {
    params: { id: snapshot_id }
  });
  let files = snapshot.data.files;
  threshold = parseFloat(threshold) / 100;
  path = (path === '' ? '/' : path);
  if (path.charAt(0) !== '/')
    path = '/' + path;

  // Results will be an array of objects describing the deviant files
  let result = [];
  AnalyzeDeviantAlgo(files, path, drive, threshold, result);
  return result;
}

/*
  This implementation does not consider the root of the drive as a folder to be analyzed.
  If a drive had nothing but 10 top-level files in it, and 1 of them had deviant permissions,
  this implementation would not report that.
  This was a design choice rather than a limitation, and can be changed in the future as necessary
*/
function AnalyzeDeviantAlgo(files, path, drive, threshold, result) {
  // For every file in this folder
  for (let parent_file of files) {
    // If there is a drive condition, and this file isn't in that drive, skip it
    if (drive !== '' && parent_file.driveName !== drive) 
      continue;

    // If the file is a folder
    if (parent_file.mimeType === 'application/vnd.google-apps.folder') {
      // If we aren't IN the path yet, we don't want to analyze this folder itself
      if (parent_file.path.indexOf(path) !== 0) {    
        // Subdirectory might be path though, so continue dfs
        AnalyzeDeviantAlgo(parent_file.content, path, drive, threshold, result);
        continue;
      }

      let groupings = new Map();
      let total_files = parent_file.content.length;

      // Go through each file in that folder, and group them according to their permissions
      for (let subfile of parent_file.content) {
        // file.permissions is an array of objects
        // We will convert to an array of strings for easier comparison/manipulation
        let file_permissions = [];
        for (let object of subfile.permissions) {
          // Make sure we don't include permission object ID's in the string - they are always unique
          file_permissions.push(JSON.stringify(object, ['email', 'type', 'role', 'domain']));
        } 

        let key = JSON.stringify(file_permissions);
        if (groupings.has(key))
          groupings.get(key).push(subfile.name);   
        else
          groupings.set(key, [subfile.name]);
      }

      // See if any group is threshold% of the total files
      let standard;
      for (let entry of groupings) {
        if ((entry[1].length/total_files) >= threshold) {
          // When we decide on a standard, save the permissions,
          // then remove from the map so we are left with just the "deviant" files
          standard = JSON.parse(entry[0]);
          groupings.delete(entry[0]);
          break;
        }
      }

      // If yes, get the deviant files and add them to results
      if (standard) {
        for (let entry of groupings) {
          let perm = JSON.parse(entry[0]);
          
          // Get the perms in both the standard and the deviant file
          let shared_perms = perm.filter(x => standard.includes(x));

          // Get the perms the deviant file has but not the standard
          let extra_perms = perm.filter(x => !shared_perms.includes(x));

          // Get the perms the standard has but not the deviant file
          let missing_perms = standard.filter(x => !shared_perms.includes(x));

          // Put a separate object into result for every file in this group
          for (let file of entry[1]) {
            let result_obj = {
              file: file, 
              parent: parent_file.name, 
              file_perms: perm, 
              standard_perms: standard, 
              extra: extra_perms, 
              missing: missing_perms
            };
            result.push(result_obj);
          }
        }
      }

      // Continue on depth first search by now analyzing subfolders of this folder
      AnalyzeDeviantAlgo(parent_file.content, path, drive, threshold, result);
    }
  }  
}