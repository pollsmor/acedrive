import {Container, Row, Col} from 'react-bootstrap'
import FileCard from './filecard'

export default function FolderCard(props) {
    const file = props.data
    const subfiles = props.data.content

    return (
        <div className='folder'>
            <Container fluid="lg">
                <Row>
                    <FileCard key={file.id} data={file}/>
                </Row>
                    <Row>
                            { subfiles.map(f => {
                                return (f.content? <FolderCard key={f.id} data={f}/> : <FileCard key={f.id} data={f}/>)
                            }) }
                    </Row>
        </Container>
      </div>
    )
}