import { getToken } from "next-auth/jwt";
import Snapshot from "../../lib/models/Snapshot";
import {
    defaultMethod,
    methodForSharing,
    methodForOwnerFrom,
    methodToCheckFolder,
    methodForPermissions,
    methodForRegex,
} from "../../Utils/searchMethods";

const queryOperator = {
    drive: { key: "driveName", method: "defaultMethod" },
    owner: { key: "owners", method: "methodForOwnerFrom" },
    creator: "user", //TODO:Check Where We can get this key
    from: { key: "sharingUser", method: "methodForOwnerFrom" },
    to: "user",
    readable: {
        key: "permissions",
        method: "methodForPermissions",
        role: "reader",
    },
    writable: {
        key: "permissions",
        method: "methodForPermissions",
        role: "writer",
    },
    sharable: {
        key: "permissions",
        method: "methodForPermissions",
        role: "owner",
    },
    name: {
        key: "name",
        method: "methodForRegex",
    },
    //TODO:Work on Content Files
    inFolder: {
        key: "permissions",
        method: "methodForRegex",
    },
    //TODO:Work on Content Files
    folder: {
        key: "permissions",
        method: "methodForRegex",
    },
    path: { key: "path", method: "defaultMethod" },
    sharing: {
        key: ["none", "anyone"],
        method: "methodForSharing",
    }, //TODO: Work on Domain
    foldersonly: { key: "isFolder", method: "methodToCheckFolder" },
};

const queryOperations = {
    defaultMethod: defaultMethod,
    methodForOwnerFrom: methodForOwnerFrom,
    methodForPermissions: methodForPermissions,
    methodForSharing: methodForSharing,
    methodToCheckFolder: methodToCheckFolder,
    methodForRegex: methodForRegex,
};

export default async function getSnapshot(req, res) {
    const token = await getToken({ req });
    if (token) {
        const snapshotId = req.query.id;
        const searchFor = req.query.query;
        const snapshot = await Snapshot.findById(snapshotId);
        const filteredResults = await searchSnapShot(snapshot.files, searchFor);
        res.json(filteredResults);
    } else {
        res.end("Invalid session.");
    }
}

const searchSnapShot = async (files, query) => {
    const splitQuery = query.split(":");
    let searchForKeywords = query;
    let fieldTofetch = "name";

    if (splitQuery.length > 0 && splitQuery[0] !== "sharing") {
        if (Object.keys(queryOperator).includes(splitQuery[0])) {
            fieldTofetch = queryOperator[splitQuery[0]].key;
            searchForKeywords = splitQuery[1];
        }
    }

    if (query === "" || searchForKeywords === "") {
        return files;
    }

    const queryObject = queryOperator[splitQuery[0]];

    let roleToSearchFor = queryObject?.role;
    if (splitQuery[0] === "sharing") {
        fieldTofetch = "permissions";
        searchForKeywords = splitQuery[1];
        if (queryObject.key.includes(searchForKeywords)) {
            roleToSearchFor = searchForKeywords;
        } else roleToSearchFor = "individual";
    }
    const searchedFiles = await queryOperations[
        queryObject?.method ? queryObject.method : "defaultMethod"
    ](files, fieldTofetch, searchForKeywords, roleToSearchFor);

    return searchedFiles;
};
