import {
  driveSearch,
  permissionSearch,
  sharedToSearch,
  fromUserSearch,
  nameSearch,
  inFolderSearch,
  underFolderSearch,
  pathSearch,
  sharingSearch
} from "../lib/searchMethods/index.js";

const operatorsList = {
  drive: { method: "driveSearch" },
  owner: { method: "permissionSearch", roles: ["owner"] },
  creator: { method: "permissionSearch", roles: ["owner"] },
  from: { method: "fromUserSearch" },
  to: { method: "sharedToSearch" },

  readable: {
    method: "permissionSearch",
    roles: ["owner", "organizer", "writer", "reader"],
  },
  writable: { method: "permissionSearch", roles: ["owner", "writer"] },
  sharable: { method: "permissionSearch", roles: ["owner", "organizer"] },

  name: { method: "nameSearch" },
  inFolder: { method: "inFolderSearch" },
  folder: { method: "underFolderSearch" },
  path: { method: "pathSearch" },

  // TODO: WORK ON SHARING WITH DOMAIN
    /*  MAKE SURE
      while using link the searchTerm = anyone
      with specific user searchTerm = email
      with specific domain searchTerm = domain
      And add a role key as well while calling the search method in case of specific user, domain
     */
  //anyone,none and specific user are working.
  sharing: { method: "sharingSearch" , roles:["individual","domain"]},
};

const regexOperations = ["name", "inFolder", "folder"];

const searchMethods = {
  driveSearch: driveSearch,
  permissionSearch: permissionSearch,
  fromUserSearch: fromUserSearch,
  sharedToSearch: sharedToSearch,
  nameSearch: nameSearch,
  inFolderSearch: inFolderSearch,
  underFolderSearch: underFolderSearch,
  pathSearch: pathSearch,
  sharingSearch: sharingSearch
};

function evaluateOperation(files, operator, indexOfColon, groups) {
  if (indexOfColon < 0) {
    return { status: "error", msg: "Invalid Operator", term: operator };
  }

  let splitOperator = [
    operator.substring(0, indexOfColon),
    operator.substring(indexOfColon + 1),
  ];
  let negated = false;
  if (splitOperator[0].startsWith("-")) {
    negated = true;
    splitOperator[0] = splitOperator[0].substring(1);
  }
  if (splitOperator[1].startsWith("\"") || splitOperator[1].startsWith("\'")){
    splitOperator[1] = splitOperator[1].substring(1, splitOperator[1].length-1)
  }

  // if this operator is not in our list of valid operators
  if (!Object.keys(operatorsList).includes(splitOperator[0])) {
    return { status: "error", msg: "Invalid Operator", term: operator };
  }

  if(splitOperator[1] == "") {
    return { status: "error", msg: "Cannot have an empty search term", term: operator };
  }

  const queryObject = operatorsList[splitOperator[0]];
  let searchTerm = splitOperator[1];
  let rolesToSearchFor = queryObject?.roles;

  // check for regex if necessary
  if (regexOperations.includes(splitOperator[0])) {
    try {
      let regex = new RegExp(searchTerm);
      searchTerm = regex;
    } catch (e) {
      return { status: "error", msg: "Invalid RegExp", term: searchTerm};
    }
  }

  const searchedFiles = searchMethods[queryObject.method](
    files,
    searchTerm,
    negated,
    rolesToSearchFor
  );

  return searchedFiles;
}

export default function searchSnapshot(files, query, prev_groups) {
  let all_operator_results = [];
  let path_present = false
  let drive_present = false

  const operators = query.split(" ");

  let groups = true;
  if (prev_groups) {
    groups = prev_groups;
  } else {
    if (operators[0] === "groups:off") {
      groups = false;
      operators.splice(0, 1);
    }
  }

  // go through the query, and get the matching files for each individual operator
  // saving ands and ors
  for (let i = 0; i < operators.length; i++) {
    let operator = operators[i];

    let indexOfColon = operator.indexOf(":")
    // if theres a " or ` we need to re-combine the operator, because there are spaces in the name
    if (operator.charAt(indexOfColon+1) == "\"") {
      let operator_parts = []
      while ( (i < operators.length) && (operators[i].charAt(operators[i].length-1) != ("\"")) ) {
        operator_parts.push(operators[i]);
        i += 1
      }
      if (i < operators.length) {
        operator_parts.push(operators[i])
      }
      else{
        return { status: "error",  msg: "No Closing \"", term: operator };
      }
      operator = operator_parts.join(" ")
    }

    if (operator.charAt(indexOfColon+1) == "\'") {
      let operator_parts = []
      while ( (i < operators.length) && (operators[i].charAt(operators[i].length-1) != ("\'")) ) {
        operator_parts.push(operators[i]);
        i += 1
      }
      if (i < operators.length) {
        operator_parts.push(operators[i])
      }
      else{
        return { status: "error", msg: "No Closing \'", term: operator };
      }
      operator = operator_parts.join(" ")
    }

    // if its a boolean operator, just save it
    if (operator === "and" || operator === "or") {
      all_operator_results.push(operator);
    }
    // else, evaluate the operator, and save the resulting list of files
    else {
      let single_operator_results;
      let parensCount = 0;

      if (operator.startsWith("(")) {
        parensCount += 1;
        let next_operator = operator.substring(1);
        operator = "";

        while (i < operators.length && parensCount > 0) {
          let openIndex = 0;
          while (next_operator.charAt(openIndex) === "(") {
            parensCount += 1;
            openIndex += 1;
          }

          let closeIndex = 1;
          while (
            next_operator.charAt(next_operator.length - closeIndex) === ")"
          ) {
            parensCount -= 1;
            closeIndex += 1;
          }
          operator = operator.concat(" ", next_operator);
          i += 1;
          next_operator = operators[i];
        }
        // we will have increased i to the next operator after the end of the parenthesis
        // but once this cycle of the overall forloop ends, i will increment passed that operator
        // so decrement i once to make sure we dont skip anything
        i -= 1;

        if (parensCount !== 0) {
          return {
            status: "error",
            msg: "Invalid Parenthesis",
            term: "(" + operator.trim()
          };
        }

        // remove the final parenthesis from the operator, then evaluate it fully before continuing
        operator = operator.substring(0, operator.length - 1);
        operator = operator.trim();
        single_operator_results = searchSnapshot(files, operator, groups);
        if (single_operator_results.status === "error") {
          return {
            status: "error",
            msg: "Invalid Operator",
            term: operator
          };
        }
        single_operator_results = single_operator_results.files;
      } else {
        operator = operator.trim();
        if (operator.substring(0, indexOfColon) == "path") {
          path_present = true
        }
        if (operator.substring(0, indexOfColon) == "drive") {
          drive_present = true
        }
        single_operator_results = evaluateOperation(files, operator, indexOfColon, groups);
        if (single_operator_results.status === "error") {
          return single_operator_results;
        }
      }

      all_operator_results.push(single_operator_results);
    }
  }

  if (all_operator_results.length % 2 !== 1) {
    return {
      status: "error",
      msg: "Boolean operators must have valid search operators on either side",
      term: query
    };
  }

  if (path_present && !drive_present) {
    return {
      status: "error",
      msg: "The path operator is invalid without the drive operator",
      term: query
    }
  }

  let results = all_operator_results[0];

  for (let k = 1; k < all_operator_results.length; k += 2) {
    let boolean_operator = all_operator_results[k];
    let next_operator_results = all_operator_results[k + 1];

    if (boolean_operator === "and") {
      results = results.filter((x) => next_operator_results.includes(x));
    } else {
      results = Array.from(new Set(results.concat(next_operator_results)));
    }
  }

  return { status: "ok", files: results };
}
