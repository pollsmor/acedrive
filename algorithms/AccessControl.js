import {
    accessControlCheck,
    groupAccessControlCheck,
} from "../Utils/accessControlMethods";

// Using An Operator List object to what method to be used and other factors for the query
const operatorsList = {
    AR: {
        method: "accessControlCheck",
        role: "reader",
        denined: false,
    },
    AW: {
        method: "accessControlCheck",
        role: "writer",
        denined: false,
    },
    DR: {
        method: "accessControlCheck",
        role: "reader",
        denined: true,
    },
    DW: {
        method: "accessControlCheck",
        role: "writer",
        denined: true,
    },
    GRP: {
        method: "groupAccessControlCheck",
    },
};

// Access Control Check Methods
const searchMethods = {
    accessControlCheck: accessControlCheck,
    groupAccessControlCheck: groupAccessControlCheck,
};

export default async function getAccessControls(files, query) {
    try {
        let filesToBeSearched = files;
        let response = {
            files: [],
            filesInViolation: [],
        };

        for await (const accessQuery of query) {
            const updatedQuery = accessQuery.value.replaceAll(" ", "");
            const splitQuery = updatedQuery.split(":");
            const accessCheckFor = operatorsList[splitQuery[0].toUpperCase()];
            const searchUsing = searchMethods[accessCheckFor.method];
            const results = await searchUsing(
                filesToBeSearched,
                splitQuery[1],
                accessCheckFor?.role,
                accessCheckFor?.denined
            );
            response.filesInViolation = [
                ...response.filesInViolation,
                ...results.violated,
            ];
            results.violated;
            response.files = results.files;
            filesToBeSearched = results.files;
        }

        return {
            status: "200",
            ...response,
        };
    } catch (error) {
        return { status: "400", msg: "Please Provide A Valid Query" };
    }
}
