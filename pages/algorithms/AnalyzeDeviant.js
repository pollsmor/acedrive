import axios from 'axios';

export default async function AnalyzeDeviant(snapshot_id, path, drive, threshold) {
    console.log("analyzing snapshot for deviant permissions")
    let snapshot = await axios.post('/api/getSnapshot', {id: snapshot_id})
    let files = snapshot.data.files
    threshold = parseFloat(threshold)/100
    // results will be an array of objects describing the deviant files
    let result = []
    AnalyzeDeviantAlgo(files, path, drive, threshold, result)
    console.log(result)
}

function AnalyzeDeviantAlgo(files, path, drive, threshold, result) {
    
    // for every file in this folder
    for (let top_level_file of files) {
        
        // if the file is a folder
        if(top_level_file.mimeType === 'application/vnd.google-apps.folder') {
            let groupings = new Map()
            let total_files = top_level_file.content.length

            // go through each file in that folder, and group them according to their permissions
            for (let subfile of top_level_file.content) {
                // file.permissions is an array of objects
                // we will convert to an array of strings for easier comparison/manipulation
                let file_permissions = []
                for (let object of subfile.permissions) {
                    // make sure we don't include permission object ID's in the string - they are always unique
                    file_permissions.push(JSON.stringify(object, ["email", "type", "role", "domain"]))
                } 

                let key = JSON.stringify(file_permissions)
                if (groupings.has(key)) {
                    let file_id_array = groupings.get(key)
                    file_id_array.push(subfile.name)
                    groupings.set(key, file_id_array)       
                }    
                else {
                    groupings.set(key, [subfile.name])
                }
            }

            // see if any group is threshold% of the total files
            let standard
            for (let entry of groupings) {
                if ((entry[1].length/total_files) > threshold) {
                    // when we decide on a standard, save the permissions
                    // then remove from the map so we are left with just the "deviant" files
                    standard = JSON.parse(entry[0])
                    groupings.delete(entry[0]) 
                    break
                }
            }

            // if yes, get the deviant files and add them to results
            if (standard) {
                for (let entry of groupings) {
                    let perm = JSON.parse(entry[0])
                    
                    // get the perms in both the standard and the deviant file
                    let shared_perms = perm.filter(x => standard.includes(x))

                    // get the perms the deviant file has but not the standard
                    let extra_perms = perm.filter(x => !shared_perms.includes(x))

                    // get the perms the standard has but not the deviant file
                    let missing_perms = standard.filter(x => !shared_perms.includes(x))

                    // put a separate object into result for every file in this group
                    for (let file of entry[1]) {
                        let result_obj = {file: file, parent: top_level_file.name, extra: extra_perms, missing: missing_perms}
                        result.push(result_obj)
                    }
                }
            }

            // continue on depth first search by now analyzing subfolders of this folder
            AnalyzeDeviantAlgo(top_level_file.content, path, drive, threshold, result)
        }
    }  
}