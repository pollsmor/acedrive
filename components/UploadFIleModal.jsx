import axios from 'axios';
import { Modal } from 'react-bootstrap'
import Dropzone from 'react-dropzone'
import { Parser } from "htmlparser2";

export default function UploadFileModal(props) {

    function onDrop(acceptedFiles) {
        let file = acceptedFiles[0]
        let reader = new FileReader()
        reader.readAsText(file);

        reader.onload = async function () {
          let members_list = []
          
          const parser = new Parser({
            onopentag(name, attributes) {
              // we want all the links with href fields
              if (name == "a" && attributes.href) {
                // get only the mail links
                if (attributes.href.startsWith("mailto:")){
                  members_list.push(attributes.href.substring("mailto:".length))
                }
              }
            }
          })
          parser.write(reader.result)
          parser.end()
          
          await axios.post('/api/uploadGroupSnapshot', {members: members_list});
        }
    }

    return (
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

            <Dropzone onDrop={onDrop}>
            {({getRootProps, getInputProps}) => (
                <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    Click to upload a file
                </div>
            )}
            </Dropzone>

        </Modal.Body>
      </Modal>
    )
}