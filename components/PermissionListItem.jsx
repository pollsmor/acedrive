import { Form, Container, Row, Col, ListGroup, Accordion, Button} from "react-bootstrap";
import { useState } from "react";
import RemovePermissionModal from "./RemovePermissionModal";


export default function PermissionListItem(props) {
    const permission = props.permission
    const file = props.file
    const [removingPerm, setRemovingPerm] = useState(false);
    console.log(file.permissions);// just a line to check wheter we can see permissionId of permission objects

    function handleRemovePermission(){
        //set state
        setRemovingPerm(true);
    }

    function handlePermClose() {
        setRemovingPerm(false);
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
                                <Form.Control type="email" defaultValue={permission.email} />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm="2">
                                Type: 
                            </Form.Label>
                            <Col sm="10">
                                <Form.Select defaultValue={permission.type}>
                                    <option>user</option>
                                    <option>group</option>
                                    <option>domain</option>
                                    <option>anyone</option>
                                </Form.Select>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm="2">
                                Role: 
                            </Form.Label>
                            <Col sm="10">
                                <Form.Select defaultValue={permission.role}>
                                    <option>owner</option>
                                    <option>organizer</option>
                                    <option>fileOrganizer</option>
                                    <option>writer</option>
                                    <option>commenter</option>
                                    <option>reader</option>
                                </Form.Select>
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