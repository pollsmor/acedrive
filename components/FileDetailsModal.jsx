import { Modal, Button, ListGroup } from "react-bootstrap";
import { useState } from "react";
import PermissionListItem from "./PermissionListItem"
import AddPermissionModal from "./AddPermissionModal"
import axios from "axios";


export default function FileDetailsModal(props) {
    const file = props.file
    const [addingPerm, setAddingPerm] = useState(false);
    //this list must have edited info and respective permission ids
    const [editedPermissionsList, setEditedPermissionsList] = useState([]);
    const groupsMap = new Map()
    for (let snapshot of props.group_snapshots) {
      groupsMap.set(snapshot.groupEmail, snapshot.members)
    }

    function handleClose() {
        setEditedPermissionsList([]);
        props.closeFileDetails()
    }

    function handleAddPermission(){
      //set state
      setAddingPerm(true);
    }

    function handlePermClose() {
      setAddingPerm(false);
    }

    async function postEditPermissions(){
      //edit this method to work for remove through dropdown as well
      const permission = ["permission edits","","","", file.id];//formatted for convenience in saveFilePermissions
      const result = await axios.post("/api/saveFilePermissions", { permission, file , editedPermissionsList });
      const success = result.data.successList;
      const failure = result.data.failureList;
      //display results of the api call
      let forPrintSuccess = success.map((e)=>{
        return [e.email +"->"+ e.role];
      });
      let forPrintFailure = failure.map((e)=>{
        return [e.email +"->"+ e.role];
      });
      //here we need to check if there are common elements between successList and failureLists
      alert("success: "+forPrintSuccess+" \n"+"failure: "+forPrintFailure);
    }

    function handleConfirmEdits(){
      if(editedPermissionsList.length >0){
        //async function for api call in saveFilePermissions
        postEditPermissions()
        //close modal
        handleClose();
      }
    }

    //copy view link for anyone function defined below
    function copyLink(){
      //async function called below
      getViewLink();
  }

  async function getViewLink(){
      let permission = ["get link"] 
      const result = await axios.post("/api/saveFilePermissions", { permission, file });
      if(result.data === "Bad Request"){
          alert("Could not acquire a view link");
      }
      else{
          //console.log("link: "+result.data.webViewLink.data.webViewLink);

          let link = result.data.webViewLink.data.webViewLink;

          // The link here gives access based on what kind of options
          // for link sharing are chosen on google drive.

          window.prompt("Sharable Link here: ", link);
      }
  }

    // console.log(error)
    return (
      <>
      {addingPerm? 
        <AddPermissionModal handlePermClose={handlePermClose} file={file}/>
      :
        <>
          {file ?
            <Modal show={true} onHide={handleClose} size="lg">
              <Modal.Header closeButton>
                <Modal.Title>File Details</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                    {
                    <>
                        <p> <span style={{fontWeight:'bold'}}>  File ID: </span> {file.id}</p>
                        <p><span style={{fontWeight:'bold'}}>  Name: </span> {file.name}</p>
                        <p><span style={{fontWeight:'bold'}}>  Type: </span> {file.isFolder ? "Folder" : "File"}</p>
                        <p><span style={{fontWeight:'bold'}}>  Drive: </span> {file.driveName}</p>
                        <p><span style={{fontWeight:'bold'}}>  Path: </span> {file.path}</p>
                        <p><span style={{fontWeight:'bold'}}>  Last Modified: </span> {file.modifiedTime}</p>
                        {file.isFolder ? 
                          (
                            <>
                              <p><span style={{fontWeight:'bold'}}>  Folder Contents: </span></p>
                              <ListGroup>
                                {file.content.map((content, index) => {
                                  return (
                                    <ListGroup.Item
                                      variant="primary"
                                      key={index}
                                      className="py-1"
                                    >
                                    {content.name}
                                    </ListGroup.Item>
                                  );
                                })}
                              </ListGroup>
                            </>
                          )
                          : null
                        }
                        <p/>
                        {
                          <>
                            <p><span style={{fontWeight:'bold'}}>  Permissions: </span></p>
                            <ListGroup>
                              {file.permissions.map((permission, index) => {
                                return (
                                  <PermissionListItem 
                                  permission={permission} 
                                  key={index} 
                                  file={file}
                                  editedPermissionsList={editedPermissionsList}//to get edited perms
                                  setEditedPermissionsList={setEditedPermissionsList}//to set edited perms
                                  group_membership={permission.type === "group" ? groupsMap.get(permission.email) : null}
                                  />
                                );
                              })}
                            </ListGroup>
                          </>
                        }
                    </>
                    }
              </Modal.Body>
              <Modal.Footer>
                {file.permissions.length > 0?
                <>
                  <Button variant="secondary" onClick={handleConfirmEdits}>
                    Confirm edits</Button>
                  <Button variant="secondary" onClick={copyLink}>
                      Sharable link
                  </Button> 
                  <Button variant="secondary" onClick={handleAddPermission}>
                    Add Permission
                  </Button>
                </>
                  :
                  <></>
                }
                <Button variant="secondary" onClick={handleClose}>
                  Close
                </Button>
              </Modal.Footer>
            </Modal>
          : null}
        </>
        }
      </>
      );
}