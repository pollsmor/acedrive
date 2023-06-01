import { Form, Container, Row, Col, ListGroup, Accordion, Modal, Button} from "react-bootstrap";
import axios from "axios";

export default function RemovePermissionModal(props) {
    const file = props.file
    let show = props.removingPerm
    const permission = props.permission
     
    function handleClose() {
        props.handlePermClose();
    }

    async function postPermission(){
        //Making a custom permission array just like for addPermissions 
        var requestType = "delete permission";
        //pushing this into the permission array
        const permission = [requestType, file.id, props.permission.permissionId];
        //Now we send the permission array and file
        const result = await axios.post("/api/saveFilePermissions", { permission , file });
        //if Bad request is returned by the above post request
        if(result.data === "Bad Request"){
            alert("Permission could not be deleted");
        }
        else{
            //if the post request results are valid then the currentSnaphotId can be retrieved from result
            var currentSnapshotId = result.data.currentSnapshotId;//retrieve the id here for the current snapshot
            var address = '/snapshot/'+currentSnapshotId;
            window.location.href = address;
            //redirecting above
        }

    }

    function handleConfirm(){
        postPermission();
        handleClose();
    }
    return (
        <>
        <Modal show={true} onClose={handleClose} size='md' className="modal-fade">
            <Modal.Header closeButton onClick={handleClose}>
                <Modal.Title>Removing Access</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div>
                    <p> <span style={{fontWeight:'bold'}}>  Email: </span> {permission.email}</p>
                </div>
                <div>
                    <p> <span style={{fontWeight:'bold'}}>  Type: </span> {permission.type}</p>
                </div>
                <div>
                    <p> <span style={{fontWeight:'bold'}}>  Role: </span> {permission.role}</p>
                </div>
                <div>
                    <p> <span style={{fontWeight:'bold'}}>  Inherited: </span> {permission.isInherited + "" }</p>
                </div>
             
                <Button onClick={handleConfirm}>
                    Confirm Removal
                </Button>  
             </Modal.Body>
        </Modal>
        </>
    );
}