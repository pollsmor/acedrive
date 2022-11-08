import {
    driveSearch,
    permissionSearch,
    sharedToSearch,
    fromUserSearch,
    nameSearch,
    inFolderSearch,
    underFolderSearch,
    pathSearch
} from "../Utils/searchMethods/index.js";

const operatorsList = {
    drive: { method: "driveSearch" },
    owner: { method: "permissionSearch", roles: ["owner"] },
    creator: { method: "permissionSearch", roles: ["owner"] },
    from: { method: "fromUserSearch" },
    to: { method: "sharedToSearch"},

    readable: { method: "permissionSearch", roles: ["owner", "organizer", "writer", "reader"] },
    writable: { method: "permissionSearch", roles: ["owner", "writer"] },
    sharable: { method: "permissionSearch", roles: ["owner", "organizer"] },
  
    name: { method: "nameSearch" },
    inFolder: { method: "inFolderSearch" },
    folder: { method: "underFolderSearch" },
    path: { method: "pathSearch" },

    // TODO: WORK ON SHARING
    sharing: { method: "none"}
};

const regexOperations = ["name", "inFolder", "folder"]

const searchMethods = {
    driveSearch: driveSearch,
    permissionSearch: permissionSearch,
    fromUserSearch: fromUserSearch,
    sharedToSearch: sharedToSearch,
    nameSearch: nameSearch,
    inFolderSearch: inFolderSearch,
    underFolderSearch: underFolderSearch,
    pathSearch: pathSearch
};

function evaluateOperation(files, operator) {
    let indexOfColon = operator.indexOf(":")
    if (indexOfColon < 0) {
        return {status: "error", msg: "Invalid Operator"} 
    }

    let splitOperator = [operator.substring(0, indexOfColon), operator.substring(indexOfColon+1)]
    let not = false
    if (splitOperator[0].startsWith("-")) {
        not = true
        splitOperator[0] = splitOperator[0].substring(1)
    }

    // if this operator is not in our list of valid operators
    if (!Object.keys(operatorsList).includes(splitOperator[0])) {
        return {status: "error", msg: "Invalid Operator"} 
    }

    const queryObject = operatorsList[splitOperator[0]];
    let searchTerm = splitOperator[1];
    let rolesToSearchFor = queryObject?.roles;

    // check for regex if necessary
    if (regexOperations.includes(splitOperator[0])) {
        try {
            let regex = new RegExp(searchTerm)
            searchTerm = regex
        }
        catch(e){
            return {status: "error", msg: "Invalid RegExp"}
        }
    }
    
    const searchedFiles =  searchMethods[queryObject.method](
        files, searchTerm, not, rolesToSearchFor);

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
                if (single_operator_results.status === "error") {
                    return {status: "error", operator: operator, msg: "Invalid Operator"} 
                }
                single_operator_results = single_operator_results.files
            }
            else {
                operator = operator.trim()
                single_operator_results = evaluateOperation(files, operator, groups)
                if (single_operator_results.status === "error") {
                    return single_operator_results
                }
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

    return {status: "ok", files: results}
};