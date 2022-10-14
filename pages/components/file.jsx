import { Card } from 'react-bootstrap';

export default function File(props) {
    const file = props.data
    let modifyTime = new Date(Date.parse(file.modifiedTime)).toString()

    return (
        <Card style={{width: '18rem', padding: '2px', margin: '10px'}}>
            <Card.Body>
                <Card.Title>{file.name}</Card.Title>
                <Card.Text>
                    Owner: {file.owner}
                </Card.Text>
                <Card.Text>
                    Last Modified: {(modifyTime)}
                </Card.Text>
            </Card.Body>
        </Card>
    )
}