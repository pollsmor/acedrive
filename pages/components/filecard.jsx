import { Card } from 'react-bootstrap';

export default function FileCard(props) {
    let component
    if(props.file) {
        component = <Card style={{width: '18rem', padding: '2px', margin: '10px'}}>
                        {props.file.isFolder ? <Card.Img variant='top' src='https://uas.edu.kw/wp-content/uploads/2018/12/folder-icon.png' /> : ""}
                        <Card.Body>
                            <Card.Title>{props.file.name}</Card.Title>
                            <Card.Text>
                                Drive: {props.file.driveName}
                            </Card.Text>
                            <Card.Text>
                                Path: {props.file.path}
                            </Card.Text>
                        </Card.Body>
                    </Card>
    }
    else {
        component = <div></div>
    }

    return (component)
}
