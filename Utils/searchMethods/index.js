import lodash from "lodash";

export const methodForOwnerFrom = (files, fieldTofetch, searchForKeywords) => {
    const searchedFiles = files.filter((file) => {
        const fileDetails = file[fieldTofetch];
        let matchedDetails = [];
        if (Array.isArray(fileDetails)) {
            matchedDetails = lodash.filter(fileDetails, (detail) => {
                if (
                    detail.displayName
                        .toLowerCase()
                        .search(searchForKeywords.toLowerCase()) !== -1
                ) {
                    return detail;
                }
            });
            if (matchedDetails.length > 0) {
                return file;
            }
        } else {
            if (fileDetails) {
                if (
                    fileDetails?.displayName
                        .toLowerCase()
                        .search(searchForKeywords.toLowerCase()) !== -1
                ) {
                    return file;
                }
            }
        }
    });
    return searchedFiles;
};

export const defaultMethod = (files, fieldTofetch, searchForKeywords) => {
    const searchedFiles = files.filter((file) => {
        const fileName = file[fieldTofetch].toLowerCase();
        if (fileName.search(searchForKeywords.toLowerCase()) !== -1) {
            return file;
        }
    });
    return searchedFiles;
};

export const methodForPermissions = (
    files,
    fieldTofetch,
    searchForKeywords,
    role
) => {
    const searchedFiles = files.filter((file) => {
        const fileDetails = file[fieldTofetch];
        let matchedDetails = [];
        if (Array.isArray(fileDetails)) {
            matchedDetails = lodash.filter(fileDetails, (detail) => {
                if (detail.type !== "anyone") {
                    if (
                        detail.email
                            .toLowerCase()
                            .search(searchForKeywords.toLowerCase()) !== -1 &&
                        detail.role.toLowerCase() === role.toLowerCase()
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
    return searchedFiles;
};

export const methodForSharing = (
    files,
    fieldTofetch,
    searchForKeywords,
    role
) => {
    const searchedFiles = files.filter((file) => {
        const fileDetails = file[fieldTofetch];
        let matchedDetails = [];
        if (Array.isArray(fileDetails)) {
            matchedDetails = lodash.filter(fileDetails, (detail) => {
                if (detail.type !== "anyone") {
                    if (role === "individual") {
                        if (
                            detail.email
                                .toLowerCase()
                                .search(searchForKeywords.toLowerCase()) !== -1
                        ) {
                            return detail;
                        }
                    } else if (role === "domain") {
                        if (
                            detail.domain.toLowerCase() ===
                            searchForKeywords.toLowerCase()
                        ) {
                            return detail;
                        }
                    }
                } else if (detail.type.toLowerCase() === role.toLowerCase()) {
                    return detail;
                }
            });
            if (fileDetails.length === 0 && role === "none") {
                return file;
            }
            if (matchedDetails.length > 0) {
                return file;
            }
        }
    });
    return searchedFiles;
};

export const methodToCheckFolder = (files, fieldTofetch, searchForKeywords) => {
    const searchedFiles = files.filter((file) => {
        const fileName = file[fieldTofetch];
        if (fileName.toString() === searchForKeywords.toLowerCase()) {
            return file;
        }
    });
    return searchedFiles;
};

export const methodForRegex = (files, fieldTofetch, searchForKeywords) => {
    const regex = new RegExp(searchForKeywords.replaceAll("/", ""), "g");
    const searchedFiles = files.filter((file) => {
        const fileName = file[fieldTofetch];
        if (fileName.search(regex) !== -1) {
            return file;
        }
    });
    return searchedFiles;
};
