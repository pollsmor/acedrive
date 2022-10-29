import { Modal, ListGroup, Tab, Col, Row, Container } from 'react-bootstrap';

export default function AnalysisResultsModal(props) {
  let analysisType = props.analysisType;
  // Set these two to the correct function depending on props.analysisType
  let listCardMap = printError;
  let explanationMap = printError;
  if (analysisType === 'File-Folder Sharing Differences') {
    listCardMap = createFileFolderListCard;
    explanationMap = createFileFolderExplanation;
  } else if (analysisType === 'Deviant Sharing') {
    listCardMap = createDeviantShareListCard;
    explanationMap = createDeviantShareExplanation;
  } else if (analysisType === 'Sharing Changes') {
    listCardMap = createSharingChangesListCard;
    explanationMap = createSharingChangesExplanation;
  }

  return (
    <Modal show={props.show} fullscreen={true} onHide={props.onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Analysis Results: {props.analysisType}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tab.Container defaultActiveKey='#link1'>
          <Row>
            <Col sm={6}>
              <ListGroup>
                { !props.results ? '' :
                  props.results.length > 0 ? 
                    props.results.map(listCardMap) : 
                    <ListGroup.Item>No results.</ListGroup.Item>
                }
              </ListGroup>
            </Col>
            
            <Col sm={6}>
              <Tab.Content>
                { props.results ? props.results.map(explanationMap) : '' } 
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </Modal.Body>
    </Modal> 
  )
}

function printError(index) {    
  return 'Error';
}

function createDeviantShareListCard(result, index) {
  let str = `File [${result.file}] has deviant permissions compared to folder [${result.parent}].`; 
  return (
    <ListGroup.Item action href={`#link${index + 1}`} key={index}>
      {str}
    </ListGroup.Item>
  );
}

function createDeviantShareExplanation(result, index) {
  let content = (
    <Container>
      <Row>
        The majority of files in folder [{result.parent}] have the following permissions:
      </Row>
      {result.standard_perms.map((permission_string, index) => {
        return (
          <Row key={index}>
            <Col sm='1'></Col>
            <Col>{permission_string}</Col>
          </Row> 
        );
      })}
      <Row><br /></Row>
    
      <Row>
          While file [{result.file}] has the following permissions:
      </Row>
      {result.file_perms.map((permission_string, index) => {
        return (
          <Row key={index}>
            <Col sm='1'></Col>
            <Col>{permission_string}</Col>
          </Row> 
        );
      })}
      <Row><br /></Row>

      <Row>
        Permissions that [{result.file}] has that the majority of files in [{result.parent}] do not:
      </Row>
      {result.extra.map((permission_string, index) => {
        return (
          <Row key={index}>
            <Col sm='1'></Col>
            <Col>{permission_string}</Col>
          </Row> 
        );
      })}
      <Row><br /></Row>

      <Row>
        Permissions that the majority of files in [{result.parent}] have that [{result.file}] does not:
      </Row>
      { result.missing.map((permission_string, index) => {
        return (
          <Row key={index}>
            <Col sm='1'></Col>
            <Col>{permission_string}</Col>
          </Row> 
        );
      })}
    </Container>
  );

  return (
    <Tab.Pane eventKey={`#link${index+1}`} key={index}>
      {content}
    </Tab.Pane>
  );
}

function createFileFolderListCard(result, index) {
  let str = `File [${result.file}] has different permissions from parent folder [${result.parent}].`;
  return (
    <ListGroup.Item action href={`#link${index+1}`} key={index}>
      {str}
    </ListGroup.Item>
  );
}

function createFileFolderExplanation(result, index) {
  let content = (
    <Container>
      <Row>
        Parent folder [{result.parent}] has the following permissions:
      </Row>
      { result.parent_perms.map((permission_string, index) => {
        return (
          <Row key={index}>
            <Col sm='1'></Col>
            <Col>{permission_string}</Col>
          </Row> 
        );
      })}
      <Row><br /></Row>

      <Row>
        While file [{result.file}] has the following permissions:
      </Row>
      { result.file_perms.map((permission_string, index) => {
        return (
          <Row key={index}>
            <Col sm='1'></Col>
            <Col>{permission_string}</Col>
          </Row> 
        );
      })}
      <Row><br /></Row>

      <Row>
        Permissions that [{result.file}] has that [{result.parent}] does not:
      </Row>
      { result.extra.map((permission_string, index) => {
        return (
          <Row key={index}>
            <Col sm='1'></Col>
            <Col>{permission_string}</Col>
          </Row> 
        );
      })}
      <Row><br /></Row>

      <Row>
        Permissions that [{result.parent}] has that [{result.file}] does not:
      </Row>
      { result.missing.map((permission_string, index) => {
        return (
          <Row key={index}>
            <Col sm='1'></Col>
            <Col>{permission_string}</Col>
          </Row> 
        );
      })}
    </Container>
  );

  return (
    <Tab.Pane eventKey={`#link${index+1}`} key={index}>
      {content}
    </Tab.Pane>
  );
}

function createSharingChangesListCard(result, index) {
  let str = '';
  if (result.type === 'new')
    str = `File [${result.file}] is a new file in snapshot ${result.second_snapshot_id}.`; 
  else
    str = `File [${result.file}] has permissions that changed between snapshots.`;

  return (
    <ListGroup.Item action href={`#link${index+1}`} key={index}>
      {str}
    </ListGroup.Item>
  );
}

function createSharingChangesExplanation(result, index) {
  let content;
  if (result.type === 'new') {
    content = (
      <Container>
        <Row>
          File [{result.file}] is a new file with the following permissions:
        </Row>
        { result.permissions.map((permission_string, index) => {
          return (
            <Row key={index}>
              <Col sm='1'></Col>
              <Col>{permission_string}</Col>
            </Row> 
          );
        })}
      </Container>
    );
  } else {
    content = (
      <Container>
        <Row>
          File [{result.file}] had the following permissions in the first snapshot:
        </Row>
        { result.first_snapshot_perms.map((permission_string, index) => {
            return (
              <Row key={index}>
                <Col sm='1'></Col>
                <Col>{permission_string}</Col>
              </Row> 
            );
        })}
        <Row><br /></Row>

        <Row>
          Meanwhile, file [{result.file}] has the following permissions in the more recent snapshot:
        </Row>
        {result.second_snapshot_perms.map((permission_string, index) => {
          return (
            <Row key={index}>
              <Col sm='1'></Col>
              <Col>{permission_string}</Col>
            </Row> 
          );
        })}
        <Row><br /></Row>

        <Row>
          Permissions that [{result.file}] has in the new snapshot that it did not in the earlier:
        </Row>
        {result.new_perms.map((permission_string, index) => {
          return (
            <Row key={index}>
              <Col sm='1'></Col>
              <Col>{permission_string}</Col>
            </Row> 
          );
        })}
        <Row><br /></Row>

        <Row>
          Permissions that [{result.file}] had in the earlier snapshot that it does not in the more recent:
        </Row>
          {result.deleted_perms.map((permission_string, index) => {
            return (
              <Row key={index}>
                <Col sm='1'></Col>
                <Col>{permission_string}</Col>
              </Row> 
            );
          })}
      </Container>
    );
  }

  return (
    <Tab.Pane eventKey={`#link${index+1}`} key={index}>
      {content}
    </Tab.Pane>
  );
}    