import { Form, Container, Row, Col, ListGroup, Accordion, Button} from "react-bootstrap";
import { useState } from "react";
import RemovePermissionModal from "./RemovePermissionModal";


export default function PermissionListItem(props) {
    const permission = props.permission
    const file = props.file
    let editedPermissionsList = props.editedPermissionsList
    let setEditedPermissionsList = props.setEditedPermissionsList;
    const [removingPerm, setRemovingPerm] = useState(false);
    //console.log(file.permissions);// just a line to check wheter we can see permissionId of permission objects

    function handleRemovePermission(){
        //set state
        setRemovingPerm(true);
    }

    function handlePermClose() {
        setRemovingPerm(false);
    }

    function handlePermissionChange(){
        var classNameMaker = "roledropdown"+permission.permissionId;
        var role = document.getElementsByClassName(classNameMaker)[0].value;
        if(editedPermissionsList.length != 0){
            var doubleEditFlag = false;//flag to help update a permission change in our editpermissionslist
            //if editedpermslist is not empty then we might need to replace perm with edited perm values to stop duplicates
            let newEditedPermissionsList = editedPermissionsList.map((e)=>{
                if(permission.permissionId != e[0].permissionId){
                    return e;//adding non changed perms back.
                }
                else{
                    doubleEditFlag = true;//flag to note that the change made is for a permission that is already in the list.
                    return [permission, role];//replacing old change value with new change value for same permissionId
                }
            });
            //newEditedPermissionsList has handled previously changed permissions, and
            //newEditedPermissionsList has handled same permission being changed multiple times
            //thus we only need to add a change for a permission that is being added to the list for the first time
            if(!doubleEditFlag){
                //This makes sure that a permission's first change is stored in editedList
                newEditedPermissionsList.push([permission, role]);
            }
            //now newEditedPermissionsList has latest changes to all permission items.
            //lets save this back to editedPermissionsList
            editedPermissionsList = newEditedPermissionsList;

        }
        else{
            //if editedpermslist is empty then this is the first change
            //editedPermissionsList = editedPermissionsList.concat([permission, role])
            editedPermissionsList.push([permission, role]);//adding first change out of any permissions
        }
        setEditedPermissionsList(editedPermissionsList);
    }

    return (
        <>
            {removingPerm? 
                <RemovePermissionModal handlePermClose={handlePermClose} file={file} permission={permission}/>
            :
                <Container className="permissions-container">
                    <Form>
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm="2">
                                Email: 
                            </Form.Label>
                            <Col sm="10">
                                <Form.Control plaintext readOnly type="email" defaultValue={permission.email} />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm="2">
                                Type: 
                            </Form.Label>
                            <Col sm="10">
                                <Form.Control  plaintext readOnly defaultValue={permission.type}>
                                </Form.Control>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm="2">
                                Role: 
                            </Form.Label>
                            <Col sm="10">
                                {permission.role!="owner"?
                                    <Form.Select defaultValue={permission.role} className={'roledropdown'+ permission.permissionId} onChange={handlePermissionChange}>
                                        {permission.type=="user"?
                                            <option>owner</option>:
                                            <></>
                                        }
                                        <option>organizer</option>
                                        {(file.id===file.driveId)||(permission.role ==="fileOrganizer")?
                                            <option>fileOrganizer</option>
                                            :
                                            <></>
                                        }
                                        <option>writer</option>
                                        <option>commenter</option>
                                        <option>reader</option>
                                    </Form.Select>
                                    :
                                    <Col sm="10">
                                    <Form.Control  className={'roledropdown'+ permission.permissionId} plaintext readOnly defaultValue={permission.role}>
                                    </Form.Control>
                                    </Col>
                                }
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm="2">
                            Inherited: 
                            </Form.Label>
                            <Col sm="10">
                            <Form.Control plaintext readOnly defaultValue={permission.isInherited}/>
                            </Col>
                        </Form.Group>
                        <Button variant="secondary" onClick={handleRemovePermission}>
                            Remove access
                        </Button>
                    </Form>
                    {props.group_membership ? 
                        <Accordion>
                            <Accordion.Item eventKey="0">
                            <Accordion.Header>Show Group Membership</Accordion.Header>
                            <Accordion.Body>
                                <ListGroup>
                                    {props.group_membership.map((member, index) => {
                                        return (
                                        <ListGroup.Item
                                            variant="primary"
                                            key={index}
                                            className="py-1"
                                        >
                                        {member}
                                        </ListGroup.Item>
                                        );
                                    })}
                                </ListGroup> 
                            </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>
                        : null}
                </Container>
            }
        </>
    )
}