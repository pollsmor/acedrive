import {
  allowedAccessControlCheck,
  deniedAccessControlCheck,
  groupAccessControlCheck
} from "../Utils/accessControlMethods";

const operatorsList = {
  AR:{
    method: "allowedAccessControlCheck",
    role: "reader"
  },
  AW:{
    method: "allowedAccessControlCheck",
    role: "writer"
  },
  DR:{
    method: "deniedAccessControlCheck",
    role: "reader"
  },
  DW:{
    method: "deniedAccessControlCheck",
    role: "writer"
  },
  GRP:{
    method: "groupAccessControlCheck",
  }
};


const searchMethods = {
  allowedAccessControlCheck: allowedAccessControlCheck,
  deniedAccessControlCheck : deniedAccessControlCheck,
  groupAccessControlCheck:groupAccessControlCheck
};

export default async function getAccessControls(files,query) {

  const splitQuery = query.split(":");
  const accessCheckFor = operatorsList[splitQuery[0].toUpperCase()];
  const searchUsing = searchMethods[accessCheckFor.method];
  const results = await searchUsing(files,splitQuery[1],accessCheckFor?.role)

  return {status:"200", files: results };
}
