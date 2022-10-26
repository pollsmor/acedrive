import { Container, Row, Col } from 'react-bootstrap';
import FileCard from './FileCard';

export default function FolderCard(props) {
  let component = <div></div>;
  if (props.file) {
    component = (
      <div className='folder'>
        <Container fluid='lg'>
          <Row>
            <FileCard key={props.file.id} file={props.file}/>
          </Row>
          <Row>
            { props.file.content.map(f => {
              if (f.isFolder) return <FolderCard key={f.id} file={f} />;
              else return <FileCard key={f.id} file={f} />;
            }) }
          </Row>
        </Container>
      </div>
    );
  }

  return component;
}