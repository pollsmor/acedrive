import { Table, ListGroup, Form, Button } from "react-bootstrap";
import Image from "next/image";
import LoadingModal from "./LoadingModal";
import { useState} from "react";

const imgUrl = "https://uas.edu.kw/wp-content/uploads/2018/12/folder-icon.png";

export default function FileTable(props) {
  const filteredData = props.files;
  const [loading, setLoading] = useState(false);

  async function updateSharing() {
    //setLoading(true);
    var selectedFiles = []
    var allBoxes = document.querySelectorAll('input[type=checkbox]')
    for (var i = 0; i < allBoxes.length; i++) {
      //if the box in allBoxes is checked then we add it to selectedFiles
      if(allBoxes[i].checked == true)
      //now we add the file id(which are the element ids of the respective checkboxes) to selectedFiles
        selectedFiles.push(allBoxes[i].id)
    }
    console.log(selectedFiles);
    //setLoading(false);
  }

  return (
    <>
    <LoadingModal show={loading}></LoadingModal>
    <Table responsive striped bordered>
      <thead>
        <tr>
          <th><Button onClick={updateSharing}>Update Sharing</Button></th>
          <th>Type</th>
          <th>Name</th>
          <th>Drive</th>
          <th>Path</th>
          <th>Contents of Folder</th>
        </tr>
      </thead>
      <tbody>
        {filteredData.length > 0
          ? filteredData.map((file) => {
              return (
                <tr key={file.id}>
                  <td>
                  {!file.isFolder && (
                    <Form.Group className="form-check">
                      <input type="checkbox" className="form-check-input" id={file.id} />
                    </Form.Group>
                  )
                  }
                  </td>
                  <td>
                    {file.isFolder && (
                      <Image
                        src={imgUrl}
                        alt="Folder icon"
                        width={20}
                        height={20}
                      />
                    )}
                  </td>
                  <td>{file.name}</td>
                  <td>{file.driveName}</td>
                  <td>{file.path}</td>
                  <td>
                    {file.isFolder ? (
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
                    ) : (
                      "--"
                    )}
                  </td>
                </tr>
              );
            })
          : null}
      </tbody>
    </Table>
    </>
  );
}
