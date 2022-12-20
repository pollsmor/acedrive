import lodash from "lodash";

export function allowedAccessControlCheck(files, searchTerm, role) {
    const updatedSearchTerm = searchTerm.replace(/}|{/g, "");
    const findForUsers = updatedSearchTerm.split(",");
    const searchedFiles = files.filter((file) => {
        const fileDetails = file["permissions"];
        let matchedDetails = [];
        if (Array.isArray(fileDetails)) {
            matchedDetails = lodash.filter(fileDetails, (detail) => {
                if (detail.type !== "anyone" && detail.type !== "domain") {
                    if (
                        findForUsers.includes(detail.email.toLowerCase()) &&
                        detail.role.toLowerCase() === role.toLowerCase()
                    ) {
                        return detail;
                    }
                }
                if (
                    detail.type === "domain" &&
                    detail.role.toLowerCase() === role.toLowerCase()
                ) {
                    if (findForUsers.includes(detail.domain.toLowerCase())) {
                        return detail;
                    }
                }
            });
            if (matchedDetails.length > 0) {
                return file;
            }
        }
    });
    const deniedFiles = files.filter((file) => {
        if (!searchedFiles.includes(file)) {
            return file;
        }
    });
    return { files: searchedFiles, violated: deniedFiles };
}

export function deniedAccessControlCheck(files, searchTerm, role) {
    const updatedSearchTerm = searchTerm.replace(/}|{/g, "");
    const findForUsers = updatedSearchTerm.split(",");
    const searchedFiles = files.filter((file) => {
        const fileDetails = file["permissions"];
        let matchedDetails = [];
        if (Array.isArray(fileDetails)) {
            matchedDetails = lodash.filter(fileDetails, (detail) => {
                if (detail.type !== "anyone" && detail.type !== "domain") {
                    if (
                        findForUsers.includes(detail.email.toLowerCase()) &&
                        detail.role.toLowerCase() === role.toLowerCase()
                    ) {
                        return detail;
                    }
                }
                if (
                    detail.type === "domain" &&
                    detail.role.toLowerCase() === role.toLowerCase()
                ) {
                    if (findForUsers.includes(detail.domain.toLowerCase())) {
                        return detail;
                    }
                }
            });
            if (matchedDetails.length > 0) {
                return file;
            }
        }
    });
    const deniedFiles = files.filter((file) => {
        if (!searchedFiles.includes(file)) {
            return file;
        }
    });
    return { files: deniedFiles, violated: searchedFiles };
}

export function groupAccessControlCheck(files, searchTerm) {
    const updatedSearchTerm = searchTerm.replace(/}|{/g, "");
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
