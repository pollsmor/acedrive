import axios from "axios";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { Container, ListGroup } from "react-bootstrap";
import Banner from "../../components/Banner";

export default function GroupSnapshot() {
  const router = useRouter();
  const { groupSnapshotID } = router.query;
  // So props.groupSnapshot.members.map() doesn't error out on initial load
  const [groupSnapshot, setGroupSnapshot] = useState({ members: [] });

  useEffect(() => {
    async function fetchGroupSnapshot() {
      try {
        let groupSnapshot = await axios.get("/api/getGroupSnapshot", {
          params: { id: groupSnapshotID },
        });
        setGroupSnapshot(groupSnapshot.data);
      } catch (err) {
        alert("This is not a valid group snapshot ID.");
        window.location.href = "/";
      }
    }

    if (groupSnapshotID) fetchGroupSnapshot();
  }, [groupSnapshotID]);

  return (
    <Container fluid className="p-0 text-center">
      <Banner />
      <Container className="my-2">
        <h3 className="fw-bold">Group Snapshot {groupSnapshotID}</h3>
        <h6>Taken: {groupSnapshot.date}</h6>
        <h3>Name: {groupSnapshot.groupName}</h3>
        <h3>Email: {groupSnapshot.groupEmail}</h3>
        <hr />
        <h1>Member List</h1>
      </Container>

      <ListGroup>
        {groupSnapshot.members.map((email) => {
          return (
            <a href={`mailto:${email}`} key={email}>
              {email}
            </a>
          );
        })}
      </ListGroup>
    </Container>
  );
}
