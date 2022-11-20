import { Table, ListGroup } from "react-bootstrap";
import Image from "next/image";

const imgUrl = "https://uas.edu.kw/wp-content/uploads/2018/12/folder-icon.png";

export default function FileTable(props) {
  const filteredData = props.files;
  return (
    <Table responsive striped bordered>
      <thead>
        <tr>
          <th>#</th>
          <th>File Name</th>
          <th>Drive</th>
          <th>Path</th>
          <th>Contents of Folder</th>
        </tr>
      </thead>
      <tbody>
        {filteredData.length > 0 ? (
          filteredData.map((file, index) => {
            return (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>
                  {file.isFolder && (
                    <Image
                      src={imgUrl}
                      alt="Folder icon"
                      width={20}
                      height={20}
                    />
                  )}
                  <br />
                  {file.name}
                </td>
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
        ) : (
          <p>No results found.</p>
        )}
      </tbody>
    </Table>
  );
}
