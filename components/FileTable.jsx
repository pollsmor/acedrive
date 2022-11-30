import { Table } from "react-bootstrap";
import Image from "next/image";

const folderUrl = "https://uas.edu.kw/wp-content/uploads/2018/12/folder-icon.png";
const fileUrl = "https://www.iconpacks.net/icons/2/free-file-icon-1453-thumb.png";

export default function FileTable(props) {
  const filteredData = props.files;

  async function openDetails(event) {
    props.openFileDetails(filteredData[event.target.id])
  }

  return (
    <>
    <Table responsive bordered hover>
      <thead>
        <tr>
          <th>Type</th>
          <th>Name</th>
          <th>Drive</th>
          <th>Path</th>
        </tr>
      </thead>
      <tbody>
        {filteredData.length > 0
          ? filteredData.map((file, index) => {
              return (
                <tr key={file.id} onClick={openDetails}>
                  <td id={index}>
                    {file.isFolder ? (
                      <Image
                        src={folderUrl}
                        alt="Folder icon"
                        width={20}
                        height={20}
                      />
                    ) : (
                      <Image
                        src={fileUrl}
                        alt="File icon"
                        width={20}
                        height={20}
                      />
                    )}
                  </td>
                  <td id={index}>{file.name}</td>
                  <td id={index}>{file.driveName}</td>
                  <td id={index}>{file.path}</td>
                </tr>
              );
            })
          : null}
      </tbody>
    </Table>
    </>
  );
}
