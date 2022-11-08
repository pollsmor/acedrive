// TODO: HANDLE GROUP MEMBERSHIP
//          -> PASS IN LIST OF OBJECTS {groupName: string, groupEmail: string, groupMembers: []}
//          -> FOR SEARCH METHODS BASED ON A USER
//                  -> GO THROUGH ALL GROUP OBJECTS AND FIND groupEmails THAT USER IS A PART OF
//                  -> let emails = [searchTerm].concat(list of group emails that user is part of)
//                  -> THEN INSTEAD OF PERMISSION.EMAIL === SEARCH TERM, DO emails.include(permission.email)


// return all files in a particular drive 
export function driveSearch (files, searchTerm) {
    let results = []
    for (let file of files) {
        if (file.driveName !== searchTerm) continue
        results.push(file)
        if (file.isFolder) { 
            let content_results = driveSearch(file.content, searchTerm)
            results = results.concat(content_results)
        }
    }
    return results
}

// given a role and a user, return all files where that user has that role
export function permissionSearch (files, searchTerm, roles) {
    let results = []
    for (let file of files) {
        for (let permission of file.permissions) {
            if (roles.includes(permission.role) && permission.email === searchTerm) {
                results.push(file)
                break
            }
        }
        if (file.isFolder) { 
            let content_results = permissionSearch(file.content, searchTerm, roles)
            results = results.concat(content_results)
        }
    }
    return results
}

// return a list of files shared directly with a user (i.e not through groups or inherited perms)
// do we need to pass a list of roles, or is any role acceptable?
export function sharedToSearch (files, searchTerm) {
    let results = []
    for (let file of files) {
        for (let permission of file.permissions) {
            if (permission.isInherited) continue
            if (permission.email === searchTerm) {
                results.push(file)
                break
            }
        }
        if (file.isFolder) { 
            let content_results = sharedToSearch(file.content, searchTerm)
            results = results.concat(content_results)
        }
    }
    return results
}


// find a list of files shared with the logged in user from the searched user
export function fromUserSearch (files, searchTerm) {
    let results = []
    for (let file of files) {
        if (file.sharingUser?.emailAddress === searchTerm) {
            results.push(file)
        }
        if (file.isFolder) { 
            let content_results = fromUserSearch(file.content, searchTerm)
            results = results.concat(content_results)
        }
    }
    return results
}

// find a list of files who's name match the passed in regex
export function nameSearch (files, searchTerm) {
    let results = []
    for (let file of files) {
        if (searchTerm.test(file.name)) results.push(file)
        if (file.isFolder) { 
            let content_results = nameSearch(file.content, searchTerm)
            results = results.concat(content_results)
        }
    }
    return results
}

// find a list of files within folders who name match the given regex
export function inFolderSearch (files, searchTerm) {
    let results = []
    for (let file of files) {
        if (file.isFolder) {
            if (searchTerm.test(file.name)) {
                for (let subfile of file.content) {results.push(subfile)}
            }

             // recursively search subfiles with actual searchTerm
            let content_results = inFolderSearch(file.content, searchTerm)
            results = results.concat(content_results)
        }
    }
    return results
}

export function underFolderSearch (files, searchTerm) {
    let results = []
    for (let file of files) {
        if (file.isFolder) {
            let content_results
            if (searchTerm.test(file.name)) {
                for (let subfile of file.content) {results.push(subfile)}
                // get ALL subfiles
                content_results = fromUserSearch(file.content, "*")
                results = results.concat(content_results) 
            }
            else {
                // otherwise search for matches as normal
                content_results = fromUserSearch(file.content, searchTerm)
                results = results.concat(content_results) 
            }
        }
    }
    return results
}

export function pathSearch (files, searchTerm) {
    let results = []
    if (!searchTerm.startsWith("/")) searchTerm = "/" + searchTerm
    for (let file of files) {
        if (file.path.startsWith(searchTerm)) {
            results.push(file)
        }
        if (file.isFolder) { 
            let content_results = pathSearch(file.content, searchTerm)
            results = results.concat(content_results)
        }
    }
    return results
}