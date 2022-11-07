import {
    defaultMethod,
    methodForSharing,
    methodForOwnerFrom,
    methodToCheckFolder,
    methodForPermissions,
    methodForRegex,
} from "../Utils/searchMethods";

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

function evaluateOperation(files, operator, groups) {
    let indexOfColon = operator.indexOf(":")
    if (indexOfColon < 0) {
        return {status: "error", msg: "Invalid Operator"} 
    }

    let splitOperator = [operator.substring(0, indexOfColon), operator.substring(indexOfColon+1)]

    if (!Object.keys(queryOperator).includes(splitOperator[0])) {
        return {status: "error", msg: "Invalid Operator"} 
    }

    let searchForKeywords
    let fieldTofetch

    const queryObject = queryOperator[splitOperator[0]];
    let roleToSearchFor = queryObject?.role;
    if (splitOperator[0] !== "sharing") {
        fieldTofetch = queryOperator[splitOperator[0]].key;
        searchForKeywords = splitOperator[1];
    }
    else {
        fieldTofetch = "permissions";
        searchForKeywords = splitOperator[1];
        if (queryObject.key.includes(searchForKeywords)) {
            roleToSearchFor = searchForKeywords;
        } else roleToSearchFor = "individual";
    }
    const searchedFiles =  queryOperations[
        queryObject?.method ? queryObject.method : "defaultMethod"
    ](files, fieldTofetch, searchForKeywords, roleToSearchFor);

    return searchedFiles;
}

export default function searchSnapshot(files, query, prev_groups) {
    let all_operator_results = []
    
    const operators = query.split(" ")

    let groups = true
    if(prev_groups) {
        groups = prev_groups
    }
    else {
        if (operators[0] === "groups:off") {
            groups = false
            operators.splice(0,1)
        }
    }

    // go through the query, and get the matching files for each individual operator
    // saving ands and ors
    for (let i = 0; i < operators.length; i++) {
        let operator = operators[i]

        // if theres a " or ` we need to re-combine the operator, because there are spaces in the name
        if (operator.indexOf("\"") > -1) {    
            do {    
                i += 1        
                operator = operator.concat(" ", operators[i])
            } while(i < operators.length && operators[i].indexOf(`\"`) < 0)

            if (i == operators.length) {
                return {status: "error", operator: operator, msg: "No Closing \""}
            }
        }

        if (operator.indexOf(`\'`) > -1) {    
            do {    
                i += 1        
                operator = operator.concat(" ", operators[i])
            } while(i < operators.length && operators[i].indexOf(`\'`) < 0)

            if (i == operators.length) {
                return {status: "error", operator: operator, msg: "No Closing \'"}
            }
        }

        // if its a boolean operator, just save it
        if (operator === "and" || operator === "or") {
            all_operator_results.push(operator)
        }
        // else, evaluate the operator, and save the resulting list of files
        else {
            let single_operator_results
            let parensCount = 0

            if(operator.startsWith('(')) {
                parensCount += 1
                let next_operator = operator.substring(1)
                operator = ""

                while (i < operators.length && parensCount > 0) {
                    let openIndex = 0
                    while(next_operator.charAt(openIndex) === "(") {
                        parensCount += 1
                        openIndex += 1
                    }

                    let closeIndex = 1
                    while(next_operator.charAt(next_operator.length - closeIndex) === ")") {
                        parensCount -= 1
                        closeIndex += 1
                    }
                    operator = operator.concat(" ", next_operator) 
                    i += 1
                    next_operator = operators[i]
                }
                // we will have increased i to the next operator after the end of the parenthesis
                // but once this cycle of the overall forloop ends, i will increment passed that operator
                // so decrement i once to make sure we dont skip anything
                i -= 1

                if (parensCount !== 0) {
                    return {status: "error", operator: operator, msg: "Invalid Parenthesis"} 
                }

                // remove the final parenthesis from the operator, then evaluate it fully before continuing
                operator = operator.substring(0, operator.length-1)
                operator = operator.trim()
                single_operator_results = searchSnapshot(files, operator)
            }
            else {
                operator = operator.trim()
                single_operator_results = evaluateOperation(files, operator, groups)
            }

            if (single_operator_results.status === "error") {
                return {status: "error", operator: operator, msg: "Invalid Operator"} 
            }
            all_operator_results.push(single_operator_results)
        }        
    }

    if(all_operator_results.length%2 !== 1) {
        return {status: "error", msg: "Boolean operators must have valid search operators on either side"}
    }

    let results = all_operator_results[0]

    for (let k = 1; k < all_operator_results.length; k+=2) {
        let boolean_operator = all_operator_results[k]
        let next_operator_results = all_operator_results[k+1]

        if (boolean_operator === "and") {
            results = results.filter(x => next_operator_results.includes(x))
        }
        else {
            results = Array.from(new Set(results.concat(next_operator_results)));
        }
    }

    return results
};