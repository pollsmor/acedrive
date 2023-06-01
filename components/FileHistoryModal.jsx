import { Modal } from "react-bootstrap";

export default function FileHistoryModal(props) {
  const { setShow, currentEvent } = props;

  function handleClose() {
    props.closeFileHistory();
  }

  const activity = setShow;

  const mods = {};

  const getModifiedPermissions = () => {
    for (const key in activity.primaryActionDetail[currentEvent]) {
      const modification = activity.primaryActionDetail.permissionChange[
        key
      ].map((add) => {
        const user = add?.user?.knownUser.personName;
        const anyone = add?.anyone ? "anyone" : null;
        return (user || anyone) + " " + add.role;
      });
      mods[key] = modification;
    }
  };

  const getModifiedRename = () => {
    for (const key in activity.primaryActionDetail[currentEvent]) {
      const modification = activity.primaryActionDetail[currentEvent][key];
      mods[key] = [modification];
    }
  };

  const getModifiedCreate = () => {
    const createMethods = {
      new: "A new file has been created!",
      copy: "A new file has been copied!",
      upload: "A new file has been uploaded!",
    };
    for (const key in activity.primaryActionDetail[currentEvent]) {
      mods[key] = [createMethods[key]];
    }
  };

  const getModifiedDelete = () => {
    const deleteMethods = {
      TYPE_UNSPECIFIED: "Deletion type is not available.",
      TRASH: "An object was put into the trash.",
      PERMANENT_DELETE: "An object was deleted permanently.",
    };
    for (const key in activity.primaryActionDetail[currentEvent]) {
      const modification = activity.primaryActionDetail[currentEvent][key];
      mods[key] = [deleteMethods[modification]];
    }
  };

  const operationsAccMod = {
    permissionChange: getModifiedPermissions,
    create: getModifiedCreate,
    rename: getModifiedRename,
    delete: getModifiedDelete,
  };

  currentEvent !== "edit" && operationsAccMod[currentEvent]();

  return (
    <>
      <Modal show={setShow} onHide={handleClose} size="lg" >
        <Modal.Header closeButton style={{color: "lightgreen", backgroundColor: "black"}}>
          <Modal.Title>File Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          FileName:{" "}
          <span>
            {activity.targets
              .map((file) => {
                return file.driveItem.title;
              })
              .join(",")}
          </span>
        </Modal.Body>

        <Modal.Body>
          Child Events:{" "}
          <div>
            {currentEvent == "edit" ? (
              "File was Edited!"
            ) : (
              <ul>
                {mods &&
                  Object.keys(mods).map((childEvent, index) => (
                    <li key={index}>
                      {childEvent}:{" "}
                      {mods[childEvent].map((mod, index) => (
                        <ul key={index}>
                          <li> {mod} </li>
                        </ul>
                      ))}
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
