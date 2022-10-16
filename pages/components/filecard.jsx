import { Card } from 'react-bootstrap';

export default function FileCard(props) {
    const file = props.data
    let modifyTime = new Date(Date.parse(file.modifiedTime)).toString()

    return (
        <Card style={{width: '18rem', padding: '2px', margin: '10px'}}>
            {file.content? <Card.Img variant='top' src='https://uas.edu.kw/wp-content/uploads/2018/12/folder-icon.png' /> : ""}
            <Card.Body>
                <Card.Title>{file.name}</Card.Title>
                <Card.Text>
                    Owner: {(file.owners.length > 0) ? file.owners[0].emailAddress : `Shared Drive`}
                </Card.Text>
                <Card.Text>
                    Path: {(file.path)}
                </Card.Text>
            </Card.Body>
        </Card>
    )
}
