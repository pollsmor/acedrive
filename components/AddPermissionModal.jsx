import { Form, Container, Row, Col, ListGroup, Accordion, Modal, Button} from "react-bootstrap";
import PermissionListItem from "./PermissionListItem";
import axios from "axios";

export default function AddPermissionModal(props) {
    const file = props.file
    let show = props.addingPerm
 
    //const permission = [];

    function handleClose() {
        props.handlePermClose();
    }

    async function postPermission(){
        //getting values from the frontend fields
        var email = document.getElementsByClassName("emailBox")[0].value;
        var type = document.getElementsByClassName("typeDropdown")[0].value;
        var role = document.getElementsByClassName("roleDropdown")[0].value;
        //below add permission is separate for type 'anyone' as there is no email necessary for this
        //add permission if type is anyone
        if(type === "anyone"){
            var requestType = "add permission anyone";
            const permission = [requestType, email, type, role, file.id];
            const result = await axios.post("/api/saveFilePermissions", { permission , file });
            if(result.data === "Bad Request"){
                alert("Options selected were unexpected, General access unchanged");
            }
            else{
                let access = result.data.permission.role;
                //console.log(type+" "+access);
                alert("Anyone with a link can now be a "+access+" for : "+file.name);
            }
        }
        else if(type === "domain"){
            //add permission if type is domain. Domain typre requires a domain which is separate from email address
            //the email field here will represent domain here
            var requestType = "add permission domain";
            var domain = email;// retrieving domain from the email box
            const permission = [requestType, domain, type, role, file.id];
            const result = await axios.post("/api/saveFilePermissions", { permission , file });
            if(result.data === "Bad Request"){
                alert("Options selected were unexpected, Permission for domain was not added");
            }
            else{
                alert(role+" permission for domain: "+domain+" added");
            }
        }
        else{
            //add permission if type is user/group
            var requestType = "add permission";
            //pushing the new permission fields into the permission array
            const permission = [requestType, email, type, role, file.id];
            //console.log("request: "+permission);

            //api call is successful even if the permission for 'group' already exists
            //so let us have a check to make sure an appropriate error message is displayed
            if(type === "group"){
                let permissions = file.permissions;
                let permissionsEmails = permissions.map((e)=>{return e.email});
                console.log(email);
                if(permissionsEmails.includes(email)){
                    alert("A permission for: "+email+" group already exists."+
                    " Please edit the permission if you want to change it");
                    return;
                }
            }
            const result = await axios.post("/api/saveFilePermissions", { permission , file });
            if(result.data === "Bad Request"){
                alert("Options selected were unexpected, Permission was not added");
            }
            else{
                alert("Permission for "+email+" added successfully");
            }
        }
    }

    function handleConfirm(){
        postPermission();
        handleClose();
    }
    return (
        <>
        <Modal show={true} onClose={handleClose} size='lg' >
            <Modal.Header closeButton onClick={handleClose}>
                <Modal.Title>Adding a Permission to {file.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
             <Form>
                <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm="2" >
                        Email/Domain: 
                    </Form.Label>
                    <Col sm="10">
                        <Form.Control type="email" defaultValue={""} className="emailBox" />
                    </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm="2" >
                        Type: 
                    </Form.Label>
                    <Col sm="10">
                        <Form.Select defaultValue={"user"} className="typeDropdown">
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
                        <Form.Select defaultValue={"reader"} className="roleDropdown">
                            <option>owner</option>
                            <option>organizer</option>
                            <option>fileOrganizer</option>
                            <option>writer</option>
                            <option>commenter</option>
                            <option>reader</option>
                        </Form.Select>
                    </Col>
                </Form.Group>
             </Form>
                <Modal.Footer>
                <Button onClick={handleConfirm}>
                    Confirm
                </Button>
                </Modal.Footer>
             </Modal.Body>
        </Modal>
        </>
    );
}