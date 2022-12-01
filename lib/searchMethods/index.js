// METHODS TO PERFORM VARIOUS TYPES OF SEARCHES: ROLE BASED, PATH PASED, REGEX BASED

// used in folder: operator to match everything
const matchAllRegExp = new RegExp(".*");

// return all files in a particular drive
export function driveSearch(files, searchTerm, negated) {
  let results = [];
  for (let file of files) {
    if (file.driveName === searchTerm) {
      if (negated) {
        continue;
      }
      results.push(file);
      if (file.isFolder) {
        let content_results = driveSearch(file.content, searchTerm, negated);
        results = results.concat(content_results);
      }
    } else {
      if (!negated) {
        continue;
      }
      results.push(file);
      if (file.isFolder) {
        let content_results = driveSearch(file.content, searchTerm, negated);
        results = results.concat(content_results);
      }
    }
  }
  return results;
}

// given a role and a user, return all files where that user has that role
export function permissionSearch(files, searchTerm, negated, roles) {
  let results = [];
  for (let file of files) {
    let perm_found = false;
    for (let permission of file.permissions) {
      if (!permission.email) {
        continue
      }
      if (roles.includes(permission.role) && searchTerm.includes(permission.email.toLowerCase())) {
        perm_found = true;
        break;
      }
    }
    // if negated is true and perm was negated found then add file
    // if negated is false and perm was found then add it
    if (!negated === perm_found) {
      results.push(file);
    }
    if (file.isFolder) {
      let content_results = permissionSearch(
        file.content,
        searchTerm,
        negated,
        roles
      );
      results = results.concat(content_results);
    }
  }
  return results;
}

// return a list of files shared directly with a user (i.e negated through groups or inherited perms)
// do we need to pass a list of roles, or is any role acceptable?
export function sharedToSearch(files, searchTerm, negated) {
  let results = [];
  for (let file of files) {
    let perm_found = false;
    for (let permission of file.permissions) {
      if (permission.isInherited) continue;
      if (!permission.email) {
        continue
      }
      if (permission.email.toLowerCase() === searchTerm.toLowerCase() && permission.role !== "owner") {
        perm_found = true;
        break;
      }
    }
    // if negated is true and perm was negated found then add file
    // if negated is false and perm was found then add it
    if (!negated === perm_found) {
      results.push(file);
    }
    if (file.isFolder) {
      let content_results = sharedToSearch(file.content, searchTerm, negated);
      results = results.concat(content_results);
    }
  }
  return results;
}

// find a list of files shared with the logged in user from the searched user
export function fromUserSearch(files, searchTerm, negated) {
  let results = [];
  for (let file of files) {
    if (searchTerm.includes(file.sharingUser?.emailAddress.toLowerCase())) {
      if (!negated) {
        results.push(file);
      }
    } else {
      if (negated) {
        results.push(file);
      }
    }
    if (file.isFolder) {
      let content_results = fromUserSearch(file.content, searchTerm, negated);
      results = results.concat(content_results);
    }
  }
  return results;
}

// find a list of files who's name match the passed in regex
export function nameSearch(files, searchTerm, negated) {
  let results = [];
  for (let file of files) {
    if (searchTerm.test(file.name)) {
      if (!negated) {
        results.push(file);
      }
    } else {
      if (negated) {
        results.push(file);
      }
    }
    if (file.isFolder) {
      let content_results = nameSearch(file.content, searchTerm, negated);
      results = results.concat(content_results);
    }
  }
  return results;
}

// find a list of files within folders who name match the given regex
export function inFolderSearch(files, searchTerm, negated) {
  let results = [];
  for (let file of files) {
    if (file.isFolder) {
      if (searchTerm.test(file.name)) {
        for (let subfile of file.content) {
          results.push(subfile);
        }
      }

      // recursively search subfiles with actual searchTerm
      let content_results = inFolderSearch(file.content, searchTerm, negated);
      results = results.concat(content_results);
    }
  }
  if (negated) {
    let all_files = getAllFiles(files);
    // return all files that aren't in the results
    let filtered_files = all_files.filter((x) => !results.includes(x));
    return filtered_files;
  }
  return results;
}

export function underFolderSearch(files, searchTerm, negated) {
  let results = [];
  for (let file of files) {
    if (file.isFolder) {
      let content_results;
      if (searchTerm.test(file.name)) {
        for (let subfile of file.content) {
          results.push(subfile);
        }
        // get ALL subfiles
        content_results = underFolderSearch(
          file.content,
          matchAllRegExp,
          negated
        );
        results = results.concat(content_results);
      } else {
        // otherwise search for matches as normal
        content_results = underFolderSearch(file.content, searchTerm, negated);
        results = results.concat(content_results);
      }
    }
  }
  if (negated) {
    let all_files = getAllFiles(files);
    // return all files that aren't in the results
    let filtered_files = all_files.filter((x) => !results.includes(x));
    return filtered_files;
  }
  return results;
}

export function pathSearch(files, searchTerm, negated) {
  let results = [];
  if (!searchTerm.startsWith("/")) searchTerm = "/" + searchTerm;
  for (let file of files) {
    if (file.path.startsWith(searchTerm)) {
      if (!negated) {
        results.push(file);
      }
    } else {
      if (negated) {
        results.push(file);
      }
    }
    if (file.isFolder) {
      let content_results = pathSearch(file.content, searchTerm, negated);
      results = results.concat(content_results);
    }
  }
  return results;
}

export function sharingSearch(files, searchTerm, negated) {
  let isNone = (searchTerm === "none")
  let results = [];
  let field = isNone ? "role" : "type"
  let target
  if (isNone) target = "owner"
  if (searchTerm === "anyone") target = ["anyone"]
  if (searchTerm === "individual") target = ["user", "group"]
  if (searchTerm === "domain") target = ["domain"]

  for (let file of files) {
    // if this is none, we want to include every result unless its shared with someone
    // otherwise, dont include it unless we find the right permission
    let include = isNone
    for (let permission of file.permissions) {
      // if we found a permission with the correct type and correct target value, include it
      if (target.includes(permission[field])) {
        // for sharing with an individual, skip the owner
        if (searchTerm === "individual" && permission.role === "owner") {
          continue
        }
        include = true
        break
      }
      // since target is "owner" for none, if we found someone with a role other than owner
      // the file is shared and must be excluded
      else if (isNone) {
        include = false
        break
      }
    }

    // if include is true and negated is false
    // or if include is false and negated is true
    // then include the results
    if (include != negated) {
      results.push(file)
    }

    if (file.isFolder) {
      let content_results = sharingSearch(file.content, searchTerm, negated)
      results = results.concat(content_results);
    }
  }

  return results 
}

function getAllFiles(files) {
  let results = [];
  for (let file of files) {
    results.push(file);
    if (file.isFolder) {
      results = results.concat(getAllFiles(file.content));
    }
  }
  return results;
}