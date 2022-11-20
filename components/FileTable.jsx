import Table from "react-bootstrap/Table";
import ListGroup from "react-bootstrap/ListGroup";
import Image from "next/image";

const imgUrl = "https://uas.edu.kw/wp-content/uploads/2018/12/folder-icon.png";

function FileTable(props) {
  const filteredData = props.files;
  return (
    <Table striped>
      <thead>
        <tr>
          <th>#</th>
          <th>File Name</th>
          <th>Drive</th>
          <th>Path</th>
          <th>Content</th>
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
                      alt="folder icon"
                      width={20}
                      height={20}
                    />
                  )}{" "}
                  {file.name}
                </td>
                <td>{file.driveName}</td>
                <td>{file.path}</td>
                <td style={{ display: "flex", height: "3.5rem" }}>
                  {file.isFolder
                    ? file.content.map((content, index) => {
                        return (
                          <>
                            <ListGroup.Item key={index}>
                              {content.name},{" "}
                            </ListGroup.Item>
                          </>
                        );
                      })
                    : "Not a folder"}
                </td>
              </tr>
            );
          })
        ) : (
          <p>Query Not Found</p>
        )}
      </tbody>
    </Table>
  );
}

export default FileTable;
