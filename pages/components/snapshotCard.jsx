import { Card, Button} from 'react-bootstrap';

export default function SnapshotCard(props) {
    const id = props.id
    const selected = props.selected
    const position = props.position
    const selecting = props.selecting

    function handleClick(e) {
        props.clickCallback(e, props.position)
    }

    return (
        <Card style={{width: '18rem', padding: '2px', margin: '10px',}} bg={selected ? 'primary' : 'light'}>
            <Card.Body>
                <Card.Title>{position+1 + "."}</Card.Title>
                <Card.Text> {"ID: " + id} </Card.Text>
                {selecting?
                <div>
                    <Card.Text>
                        Click to Select
                    </Card.Text>
                    <Button onClick={handleClick} variant={selected ? 'light' : 'primary'}> {selected ? 'Unselect' : 'Select'}</Button>
                </div>:""
                }
            </Card.Body>
        </Card>
    )
}
