import {Container, Row, Col} from 'react-bootstrap'
import FileCard from './filecard'

export default function FolderCard(props) {
    let component
    if(props.file) {
        component = <div className='folder'>
                        <Container fluid="lg">
                            <Row>
                                <FileCard key={props.file.id} file={props.file}/>
                            </Row>
                            <Row>
                                { props.file.content.map(f => {
                                    return (f.isFolder ? <FolderCard key={f.id} file={f}/> : <FileCard key={f.id} file={f}/>)
                                }) }
                            </Row>
                        </Container>
                    </div>
    }
    else {
        component = <div></div>
    }

    return component
}