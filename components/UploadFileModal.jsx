import axios from "axios";
import { useState } from "react";
import { Modal, Form } from "react-bootstrap";
import Dropzone from "react-dropzone";
import { Parser } from "htmlparser2";
import ErrorModal from "./ErrorModal"

export default function UploadFileModal(props) {
  const [groupName, setGroupName] = useState("");
  const [groupEmail, setGroupEmail] = useState("");
  const [error, setError] = useState(null);

  function closeError () {
    setError(null)
  }

  function onDrop(acceptedFiles) {
    // TODO: more robust error messaging for missing groupName and groupEmail
    if (groupName === "" || groupEmail === "") {
      setError({msg: "Cannot have empty Group name or Group email"})
      return
    }

    let file = acceptedFiles[0];
    let timestamp = file.lastModified
    let reader = new FileReader();
    reader.readAsText(file);

    reader.onload = async function () {
      let members_list = [];

      const parser = new Parser({
        onopentag(name, attributes) {
          // we want all the links with href fields
          if (name == "a" && attributes.href) {
            // get only the mail links
            if (attributes.href.startsWith("mailto:")) {
              members_list.push(attributes.href.substring("mailto:".length));
            }
          }
        },
      });
      parser.write(reader.result);
      parser.end();

      await axios.post("/api/uploadGroupSnapshot", {
        members: members_list,
        groupName: groupName,
        groupEmail: groupEmail,
        timestamp: timestamp
      });

      // TODO: implement some kind of success message so users know the group snapshot has been saved
      props.closeCallback();
      window.location.reload();
    };
  }

  return (
    <>
    <ErrorModal error={error} closeErrorModal={closeError}/>
    <Modal
      size="lg"
      show={props.show}
      onHide={props.closeCallback}
      aria-labelledby="example-modal-sizes-title-lg"
    >
      <Modal.Header closeButton>
        <Modal.Title id="example-modal-sizes-title-lg">
          Upload the HTML file of a Google Group membership list page
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-2">
            <Form.Label>Group Name</Form.Label>
            <Form.Control
              type="name"
              placeholder="Enter group name..."
              onChange={(e) => setGroupName(e.target.value)}
            />
            <Form.Text className="text-muted">
              Name of the Google Group.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Group Email</Form.Label>
            <Form.Control
              placeholder="Enter group email..."
              onChange={(e) => setGroupEmail(e.target.value)}
            />
            <Form.Text className="text-muted">
              Email address of the Google Group.
            </Form.Text>
          </Form.Group>
        </Form>

        <Dropzone onDrop={onDrop}>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              Click to upload a file
            </div>
          )}
        </Dropzone>
      </Modal.Body>
    </Modal>
  </>);
}
