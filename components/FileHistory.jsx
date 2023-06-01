import axios from "axios";
import Banner from "./Banner";
import ErrorModal from "./ErrorModal";
import LoadingModal from "./LoadingModal";
import { useState, useEffect, useRef } from "react";
import AccessControlCard from "./AccessControlCard";
import {
  Container,
  Row,
  ListGroup,
  Alert,
  Col,
  Table,
  Button,
} from "react-bootstrap";
import { useRouter } from "next/router";
import FileHistoryModal from "./FileHistoryModal";

export default function FileHistory(props) {
  const session = props.session;
  const router = useRouter();

  const [fileHistory, setFileHistory] = useState([]);

  const [nextPageToken, setNextPageToken] = useState(null);

  const getFileHistory = async (fileId, isFolder) => {
    const fileHistory = await axios.post(
      `/api/getFileHistory?id=${fileId}&isFolder=${isFolder}`,
      {
        nextPageToken: nextPageToken,
      },
    );

    setNextPageToken(fileHistory.data?.nextPageToken);
    setFileHistory(fileHistory.data?.activityData);
  };

  const getFilePaginated = async (fileId, isFolder, stopSignal) => {
    const fileHistory = await axios.post(
      `/api/getFileHistory?id=${fileId}&isFolder=${isFolder}`,
      {
        nextPageToken: nextPageToken,
      },
    );
    setNextPageToken(fileHistory.data?.nextPageToken);
    fileHistory.data?.activityData &&
      setFileHistory(fileHistory.data?.activityData);
  };

  const [error, setError] = useState(null);
  const { fileId, isFolder } = router.query;
  const isFileCaptured = useRef(false);
  const closeError = () => {
    setError(null);
  };

  useEffect(() => {
    if (fileId && isFolder && !isFileCaptured.current) {
      isFileCaptured.current = true;
      getFileHistory(fileId, isFolder);
    }
  }, [fileId, isFolder]);

  const [showView, setShowView] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);

  const closeFileHistory = () => {
    setShowView(false);
  };

  const parent = ["create", "edit", "rename", "permissionChange", "delete"];
  return (
    <>
      <Banner />
      <ErrorModal error={error} closeErrorModal={closeError} />
      <Container fluid>
        <div className="mt-2">
          <Table responsive bordered hover style={{borderColor: "lightgreen"}}>
            <thead>
              <tr style={{color: "lightgreen", backgroundColor: "black"}}>
                <th>S.No</th>
                {isFolder == "true" && <th>File Name</th>}
                <th>Action Name</th>
                <th>Modified By</th>
                {/* <th>Modification</th> */}
                <th>TimeStamp</th>
                <th>Parent Event</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {fileHistory && fileHistory.length > 0
                ? fileHistory.map((activity, index) => {
                    return (
                      <tr key={index}>
                        <td id={index}>{index + 1}</td>
                        {isFolder == "true" && (
                          <td>
                            {activity.targets
                              .map((file) => {
                                return file.driveItem.title;
                              })
                              .join(",")}
                          </td>
                        )}

                        <td id={index}>
                          {Object.keys(activity.primaryActionDetail)[0]}
                        </td>

                        <td id={index}>
                          {activity.actors
                            .map((actor) => {
                              return actor.user.knownUser.personName;
                            })
                            .join(",")}
                        </td>
                        {/* <td id={index}>
                          {activity.primaryActionDetail.permissionChange
                            ?.addedPermissions &&
                            activity.primaryActionDetail.permissionChange?.addedPermissions?.map(
                              (add) => {
                                const user = add?.user?.knownUser.personName;
                                const anyone = add?.anyone ? "anyone" : null;
                                return (user || anyone) + " " + add.role + ", ";
                              },
                            )}
                          {activity.primaryActionDetail.permissionChange
                            ?.removedPermissions &&
                            activity.primaryActionDetail.permissionChange?.removedPermissions?.map(
                              (add) => {
                                const user = add?.user?.knownUser.personName;
                                const anyone = add?.anyone ? "anyone" : null;
                                return (user || anyone) + " " + add.role + ", ";
                              },
                            )}
                        </td> */}
                        <td id={index}>
                          {new Date(activity.timestamp).toString()}
                        </td>
                        <td id={index}>
                          {parent.includes(
                            Object.keys(activity.primaryActionDetail)[0],
                          )
                            ? "YES"
                            : "NO"}
                        </td>
                        <td>
                          {parent.includes(
                            Object.keys(activity.primaryActionDetail)[0],
                          ) && (
                            <Button
                              onClick={() => {
                                setShowView(activity);
                                setCurrentEvent(
                                  Object.keys(activity.primaryActionDetail)[0],
                                );
                              }}
                            >
                              Click For Child Event
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                : null}
            </tbody>
          </Table>
          {showView && (
            <FileHistoryModal
              fileHistory={fileHistory}
              isFolder={isFolder}
              setShow={showView}
              currentEvent={currentEvent}
              closeFileHistory={closeFileHistory}
            />
          )}
          {nextPageToken && (
            <Button
              onClick={() => {
                getFilePaginated(fileId, isFolder);
              }}
            >
              Load More
            </Button>
          )}
        </div>
      </Container>
    </>
  );
}
