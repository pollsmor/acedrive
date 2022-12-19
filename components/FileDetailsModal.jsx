import { Modal, Button, ListGroup } from "react-bootstrap";
import { useState } from "react";
import PermissionListItem from "./PermissionListItem"
import AddPermissionModal from "./AddPermissionModal"
import axios from "axios";


export default function FileDetailsModal(props) {
    const file = props.file
    //addingPerm is for the add permissio modal 
    const [addingPerm, setAddingPerm] = useState(false);
    const [editedPermissionsList, setEditedPermissionsList] = useState([]);
    //editedPermissionsList will have edited info for permissions in the form:
    //[[permission, desired role], [], [], ...]
    const groupsMap = new Map()
    for (let snapshot of props.group_snapshots) {
      groupsMap.set(snapshot.groupEmail, snapshot.members)
    }

    function handleClose() {
      //On close of FileDetailsModal, the modal on reopen will set dropdown values to default.values 
      //on rendering again. Thus we need to set the editedPermissionsList to empty.
      setEditedPermissionsList([]);
      props.closeFileDetails()
    }

    function handleAddPermission(){
      //set state for addPermission modal
      setAddingPerm(true);
    }

    function handlePermClose() {
      //set statte to close addPermission modal
      setAddingPerm(false);
    }

    async function postEditPermissions(){
      //The custom permission array here has "" string fields to keep the format of the
      //permission array used in other request types such as 'add' and 'remove'
      const permission = ["permission edits","","","", file.id];//formatted for convenience in saveFilePermissions
      const result = await axios.post("/api/saveFilePermissions", { permission, file , editedPermissionsList });
      window.alert("Updating Snapshot");
      var currentSnapshotId = result.data.currentSnapshotId;//retrieve the id here for the current snapshot
      var address = '/snapshot/'+currentSnapshotId;
      window.location.href = address;
      //redirect to current snapshot page
    }

    function handleConfirmEdits(){
      if(editedPermissionsList.length >0){
        //async function for api call in saveFilePermissions
        let promptAnswer = window.confirm("Edit Changed permissions?");
        if(promptAnswer){
          postEditPermissions()
          //close modal
          handleClose();
        }
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
          //We get the link from the post response
          let link = result.data.webViewLink.data.webViewLink;

          // The link here gives access based on what kind of options
          // for an (anyone) permission were added. Otherwise, default options for 
          // sharing through web link stands.

          window.prompt("Sharable Link here: ", link);
      }
  }

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