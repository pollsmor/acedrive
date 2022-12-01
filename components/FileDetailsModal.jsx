import { Modal, Button, ListGroup } from "react-bootstrap";
import PermissionListItem from "./PermissionListItem"

export default function FileDetailsModal(props) {
    const file = props.file
    const groupsMap = new Map()
    for (let snapshot of props.group_snapshots) {
      groupsMap.set(snapshot.groupEmail, snapshot.members)
    }

    function handleClose() {
        props.closeFileDetails()
    }

    // console.log(error)
    return (
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
                <Button variant="secondary" onClick={handleClose}>
                  Close
                </Button>
              </Modal.Footer>
            </Modal>
          : null}
        </>
      );
}