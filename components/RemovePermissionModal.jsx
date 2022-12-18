import { Form, Container, Row, Col, ListGroup, Accordion, Modal, Button} from "react-bootstrap";
import axios from "axios";
import { useState } from "react";
import SnapshotCard from "./SnapshotCard";

export default function RemovePermissionModal(props) {
    const file = props.file
    let show = props.removingPerm
    const permission = props.permission
    //console.log(permission);
    const [updatingSnapshot, setUpdatingSnapshot] = useState(false);
 
    function handleClose() {
        props.handlePermClose();
    }

    async function postPermission(){
        //edit the request underneath
        var requestType = "delete permission";
        //pushing the into the permission array
        const permission = [requestType, file.id, props.permission.permissionId];
        //console.log("request: "+permission);
        //Now we send the permission array and file
        const result = await axios.post("/api/saveFilePermissions", { permission , file });
        //console.log(result.data);
        if(result.data === "Bad Request"){
            alert("Permission not found. Please use a new snapshot");
        }
        else{
            alert(props.permission.email+" no longer has access. Please take a new snapshot to view changes");
            setUpdatingSnapshot(true);//this might be unnecessary
            
            var currentSnapshotId = result.data.currentSnapshotId;//retrieve the id here for the current snapshot
            var address = '/snapshot/'+currentSnapshotId;
            window.location.href = address;
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