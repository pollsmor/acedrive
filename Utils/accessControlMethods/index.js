import lodash from "lodash";

/*  
  Checking for Access Controls for the specified query
  Checking for the domain or email provided in the query on the file permissions
  Returning files that are following the Access Conditions provided in the Query
*/
export function accessControlCheck(files, searchTerm, role, type) {
    try {
        console.log("ser", searchTerm, files);
        const updatedSearchTerm = searchTerm.replace(/}|{/g, "");
        const findForUsers = updatedSearchTerm.split(",");
        const validFiles = files.filter((file) => {
            const fileDetails = file["permissions"];
            let matchedDetails = [];
            if (Array.isArray(fileDetails)) {
                matchedDetails = lodash.filter(fileDetails, (detail) => {
                    if (detail.type !== "anyone" && detail.type !== "domain") {
                        if (
                            (findForUsers.includes(
                                detail.email.toLowerCase()
                            ) &&
                                detail.role.toLowerCase() ===
                                    role.toLowerCase()) ||
                            (findForUsers.includes(
                                detail.email.toLowerCase()
                            ) &&
                                detail.role.toLowerCase() === "owner")
                        ) {
                            return detail;
                        }
                    }
                    if (
                        detail.type === "domain" &&
                        detail.role.toLowerCase() === role.toLowerCase()
                    ) {
                        if (
                            findForUsers.includes(detail.domain.toLowerCase())
                        ) {
                            return detail;
                        }
                    }
                });
                if (matchedDetails.length > 0) {
                    return file;
                }
            }
        });

        //Filtering the violated files
        const violatedFiles = files.filter((file) => {
            if (!validFiles.includes(file)) {
                return file;
            }
        });

        //returning files depending on the condition if it allowed/denied
        return {
            files: type ? violatedFiles : validFiles,
            violated: type ? validFiles : violatedFiles,
        };
    } catch (error) {
        throw error;
    }
}

/*  
  Checking for Access Controls for the specified query
  Checking for if the file has a Group Access Control Specified in the permissions
  Returning files that are following the Access Conditions provided in the Query
*/
export function groupAccessControlCheck(files, searchTerm) {
    const updatedSearchTerm = searchTerm.replace(/}|{/g, "");

    //converting the string value of true or false we are getting from the Query
    const boolean = updatedSearchTerm.toLowerCase() === "true";
    const searchedFiles = files.filter((file) => {
        const fileDetails = file["permissions"];
        let matchedDetails = [];
        if (Array.isArray(fileDetails)) {
            matchedDetails = lodash.filter(fileDetails, (detail) => {
                if (detail.type === "group") {
                    return detail;
                }
            });
            if (matchedDetails.length > 0) {
                return file;
            }
        }
    });

    const notGroupFiles = files.filter((file) => {
        if (!searchedFiles.includes(file)) {
            return file;
        }
    });

    const response = {
        files: boolean ? searchedFiles : notGroupFiles,
        violated: boolean ? notGroupFiles : searchedFiles,
    };

    return response;
}
