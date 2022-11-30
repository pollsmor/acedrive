import { Form, Container, Row, Col} from "react-bootstrap";

export default function PermissionListItem(props) {
    const permission = props.permission
    
    return (
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
            </Form>
        </Container>
    )
}