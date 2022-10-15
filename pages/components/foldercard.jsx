import {Container, Row} from 'react-bootstrap'
import FileCard from './filecard'

export default function FolderCard(props) {
    const file = props.data
    const subfiles = props.data.content

    return (
        <Container fluid="lg" style={{border:'2px'}}>
            <Row>
                <FileCard key={file.id} data={file}/>
            </Row>
            <Row>
                { subfiles.map(f => {
                return (<FileCard key={f.id} data={f}/>)
                }) }
            </Row>
      </Container>
    )
}