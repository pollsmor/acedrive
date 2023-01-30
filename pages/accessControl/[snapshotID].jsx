import axios from "axios";
import { useState, useEffect } from "react";
import {
    Container,
    Button,
    Row,
    ListGroup,
    Form,
    FormControl,
    Alert,
    FormGroup,
    FormLabel,
    Pagination,
} from "react-bootstrap";
import Banner from "../../components/Banner";
import LoadingModal from "../../components/LoadingModal";
import ErrorModal from "../../components/ErrorModal";
import HelpModal from "../../components/HelpModal";
import { useRouter } from "next/router";
import FileTable from "../../components/FileTable";
import FolderCard from "../../components/FolderCard";
import FileCard from "../../components/FileCard";
import searchSnapshot from "../../algorithms/SearchSnapshot";
import accessControlCheck from "../../algorithms/AccessControl";

export default function AccessControl(props) {
    const inputArr = [
        {
            value: "",
        },
    ];

    const router = useRouter();

    const [help, setHelp] = useState(null);
    const [alert, setAlert] = useState("");
    const [show, setShow] = useState(false);
    const [error, setError] = useState(null);
    const [update, setUpdate] = useState(true);
    const [loading, setLoading] = useState(false);
    const [searchquery, setSearchQuery] = useState("");
    const [accessInput, setAccessInput] = useState(inputArr);
    const [accessControlQueries, setAccessControlQueries] = useState([]);

    const { snapshotID } = router.query;

    const [groupSnapshots, setGroupSnapshots] = useState([]);
    const [userEmail, setUserEmail] = useState("");

    const [snapshot, setSnapshot] = useState({});
    const [pageFiles, setPageFiles] = useState([]);
    const [activePage, setActivePage] = useState(1);

    const [filteredFiles, setFilteredFiles] = useState([]);
    const [filesInViolation, setFilesInViolation] = useState([]);
    const [showingResults, setShowingResults] = useState(false);

    useEffect(() => {
        async function fetchSnapshot() {
            try {
                let snapshot = await axios.get("/api/getSnapshot", {
                    params: { id: snapshotID },
                });
                setSnapshot(snapshot.data);
                setFilteredFiles(snapshot.data.files);

                let user = await axios.get("/api/getUser");
                setUserEmail(user.data.email);

                let groupSnapshotMap = new Map();
                let file_snapshot_time = new Date(snapshot.data.date).getTime();

                for (let group_snapshot of user.data.groupSnapshotInfo) {
                    if (groupSnapshotMap.has(group_snapshot.email)) {
                        let current_diff = Math.abs(
                            groupSnapshotMap.get(group_snapshot.email)
                                .timestamp - file_snapshot_time
                        );
                        let new_diff = Math.abs(
                            group_snapshot.timestamp - file_snapshot_time
                        );
                        if (new_diff < current_diff) {
                            groupSnapshotMap.set(
                                group_snapshot.email,
                                group_snapshot
                            );
                        }
                    } else {
                        groupSnapshotMap.set(
                            group_snapshot.email,
                            group_snapshot
                        );
                    }
                }

                let group_snapshot_ids = [];
                for (let group_snapshot of groupSnapshotMap.values()) {
                    group_snapshot_ids.push(group_snapshot.id);
                }

                let list_of_group_snapshot = await axios.post(
                    "/api/getListOfGroupMemberships",
                    {
                        id_list: group_snapshot_ids,
                    }
                );
                setGroupSnapshots(list_of_group_snapshot.data);
            } catch (err) {
                alert("This is not a valid snapshot ID.");
                window.location.href = "/";
            }
        }

        if (snapshotID) fetchSnapshot();
    }, [snapshotID]);

    const closeError = () => {
        setError(null);
    };
    const closeHelp = () => {
        setHelp(false);
    };

    const validateAccessControl = (accessControl) => {
        try {
            const emailRegEx =
                /^(([a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)*))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

            const domainRegEx =
                /^((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

            const vaildAccessControls = ["AR", "AW", "DR", "DW"];

            const validAccessQuery = accessControl.map((query) => {
                console.log(query.value);
                const updatedQuery = query.value.replaceAll(" ", "");
                if (!updatedQuery.includes(":")) {
                    return false;
                }
                const splitQuery = updatedQuery.split(":");

                const validAccessControlMethod =
                    vaildAccessControls.includes(splitQuery[0].toUpperCase()) &&
                    splitQuery[1].charAt(0) === "{" &&
                    splitQuery[1].charAt(splitQuery[1].length - 1) === "}";

                const queryParams = splitQuery[1].substring(
                    1,
                    splitQuery[1].length - 1
                );
                const splitParameters = queryParams.split(",");

                const validations = splitParameters.map((parameter) => {
                    if (
                        emailRegEx.test(parameter) ||
                        domainRegEx.test(parameter)
                    ) {
                        return true;
                    } else {
                        return false;
                    }
                });

                return validations.includes(false) || !validAccessControlMethod
                    ? false
                    : true;
            });
            return validAccessQuery;
        } catch (error) {
            throw error;
        }
    };

    const addAccessControlHandler = async (e) => {
        e.preventDefault();
        console.log("adadjadjadjalkjd", searchquery, accessInput);

        const validAccessQuery = validateAccessControl(accessInput);
        console.log(validAccessQuery);

        if (validAccessQuery.includes(false)) {
            setError({ msg: "Please Enter A Valid Access Control Query" });
        } else {
            const userQueries = await axios.post(
                "/api/accessControl/saveAccessControl",
                {
                    searchQuery: searchquery,
                    accessControlQuery: accessInput.map((query) => query.value),
                }
            );
            userQueries.status === 200 ? setUpdate(true) : setUpdate(false);
        }
    };

    const accessControlHandler = async (e) => {
        e.preventDefault();
        console.log("hhhehehehhe0", searchquery);
        if (searchquery === "") {
            setShowingResults(false);
            return setFilteredFiles(snapshot.files);
        }

        let searchResults = await searchSnapshot(
            snapshot.files,
            searchquery,
            null,
            groupSnapshots,
            userEmail
        );
        //console.log(searchResults);

        const accessResults = await accessControlCheck(
            searchResults.files,
            accessInput
        );

        console.log(accessResults);

        if (searchResults.status !== "ok" || accessResults.status !== "200") {
            setError(searchResults);
            return;
        }

        setFilteredFiles(accessResults.files);
        setFilesInViolation(accessResults.filesInViolation);
        setShowingResults(true);
    };

    const getUserAccessControls = async () => {
        try {
            const access = await axios.post(
                "/api/accessControl/getAccessControl"
            );
            setAccessControlQueries(access.data.accessControl);
            setUpdate(false);
        } catch (error) {
            setError({
                msg: "Some Error Occured",
            });
        }
    };

    const deleteAccessControl = async (accessControl) => {
        try {
            const access = await axios.post(
                "/api/accessControl/deleteAccessControl",
                {
                    accessId: accessControl._id,
                }
            );
            setShow(true);
            setAlert(access.data.message);
            setUpdate(true);
        } catch (error) {
            setError({
                msg: "Error Deleting Access Control",
            });
        }
    };

    const addFormInput = () => {
        setAccessInput([...accessInput, { value: "" }]);
    };

    useEffect(() => {
        if (update) {
            getUserAccessControls();
        }
    }, [update]);

    let items = [];
    const filesPerPage = 10;

    let amtPages =
        filteredFiles && Math.ceil(filteredFiles.length / filesPerPage);
    for (let page = 1; page <= amtPages; page++) {
        items.push(
            <Pagination.Item
                key={page}
                active={page === activePage}
                onClick={() => setActivePage(page)}
            >
                {page}
            </Pagination.Item>
        );
    }

    // Only get files present on a specific page
    let startFileIdx = filesPerPage * (activePage - 1);
    let endFileIdx = startFileIdx + filesPerPage;
    // ====================================================
    useEffect(() => {
        if (filteredFiles) {
            setPageFiles(filteredFiles.slice(startFileIdx, endFileIdx));
        }
    }, [filteredFiles, startFileIdx, endFileIdx]);

    return (
        <>
            <Banner />
            <Container fluid className="text-center my-2">
                <h3 className="fw-bold">Snapshot {snapshotID}</h3>
                <h6>Taken: {snapshot.date}</h6>
            </Container>
            {help && <HelpModal closeErrorModal={closeHelp} />}
            <ErrorModal error={error} closeErrorModal={closeError} />

            <Container fluid>
                <LoadingModal show={loading} />
                <hr />
                {show && (
                    <Alert
                        variant="danger"
                        onClose={() => setShow(false)}
                        dismissible
                    >
                        {alert}
                    </Alert>
                )}
                <h5>Add Access Controls</h5>
                <Button
                    onClick={() => {
                        setHelp(true);
                    }}
                    variant="info"
                    className="mb-3 "
                >
                    Instructions
                </Button>
                <Form onSubmit={accessControlHandler}>
                    <FormGroup as={Row} className="d-flex mx-3 mb-3">
                        <FormLabel>Search Query:</FormLabel>

                        <FormControl
                            required
                            type="text"
                            className="mx-2"
                            value={searchquery}
                            placeholder="Add Search Query"
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </FormGroup>
                    <FormGroup as={Row} className="d-flex mx-3 mb-3">
                        <FormLabel>Access Control Query:</FormLabel>
                        {accessInput.map((input, index) => {
                            return (
                                <FormControl
                                    required
                                    type="text"
                                    className="mx-2 mb-2"
                                    value={accessInput[index].value}
                                    placeholder="Add Access Control"
                                    key={index}
                                    id={index}
                                    onChange={(e) => {
                                        const index = e.target.id || 0;
                                        setAccessInput((input) => {
                                            const newInput = input.slice();
                                            newInput[index].value =
                                                e.target.value;
                                            return newInput;
                                        });
                                    }}
                                />
                            );
                        })}

                        <Button
                            variant="secondary"
                            className="mx-2 md-1"
                            onClick={addFormInput}
                        >
                            Add Access
                        </Button>
                    </FormGroup>

                    <Button
                        variant="secondary"
                        onClick={addAccessControlHandler}
                        className="mx-4"
                    >
                        Save Access Control
                    </Button>
                    <Button
                        variant="secondary"
                        // onClick={addAccessControlHandler}
                        className="mx-4"
                        type="submit"
                    >
                        Search
                    </Button>
                </Form>
                {accessControlQueries.length > 0 ? (
                    <Container fluid className="px-0 py-2">
                        <h5>Previous searched Queries:</h5>
                        <ListGroup as="ol" numbered>
                            {accessControlQueries
                                .slice(0, 5)
                                .map((accessControl, idx) => {
                                    return (
                                        <ListGroup.Item
                                            key={idx}
                                            className="py-1 d-inline-block"
                                        >
                                            {accessControl.searchQuery},{" "}
                                            {accessControl.accessControlQuery}
                                            <Button
                                                variant="primary"
                                                className="mx-2"
                                                onClick={(
                                                    event,
                                                    accessControlLocal = accessControl
                                                ) => {
                                                    setSearchQuery(
                                                        accessControl.searchQuery
                                                    );
                                                    setAccessInput(() => {
                                                        return accessControl.accessControlQuery.map(
                                                            (query) => {
                                                                return {
                                                                    value: query,
                                                                };
                                                            }
                                                        );
                                                    });
                                                }}
                                            >
                                                Select
                                            </Button>
                                            <Button
                                                variant="danger"
                                                className="mx-2"
                                                onClick={(
                                                    event,
                                                    accessControlLocal = accessControl
                                                ) => {
                                                    deleteAccessControl(
                                                        accessControlLocal
                                                    );
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        </ListGroup.Item>
                                    );
                                })}
                        </ListGroup>
                    </Container>
                ) : null}

                {showingResults ? (
                    <>
                        <p style={{ fontWeight: "bold" }}>Valid Files: </p>
                        <FileTable files={filteredFiles} />

                        <p style={{ fontWeight: "bold" }}>
                            Files In Violations:{" "}
                        </p>
                        <FileTable files={filesInViolation} />
                    </>
                ) : (
                    <>
                        <FileTable files={pageFiles} />
                        <Pagination className="justify-content-center m-3">
                            <Pagination.Prev
                                disabled={activePage <= 1}
                                onClick={() => setActivePage(activePage - 1)}
                            >
                                prev
                            </Pagination.Prev>
                            {items}
                            <Pagination.Next
                                disabled={activePage >= amtPages}
                                onClick={() => setActivePage(activePage + 1)}
                            >
                                next
                            </Pagination.Next>
                        </Pagination>
                    </>
                )}
            </Container>
        </>
    );
}
