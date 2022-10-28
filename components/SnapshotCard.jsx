import { Card, Button } from 'react-bootstrap';
import Link from 'next/link';

export default function SnapshotCard(props) {
  const id = props.id;
  const selected = props.selected;
  const selecting = props.selecting;

  function handleClick(e) {
    props.clickCallback(e, props.position)
  }

  return (
    <Card
      className='my-3'
      style={{ width: '21rem' }} 
      bg={selected ? 'warning' : 'light'}
    >
      <Card.Body>
          <Card.Title>
            <Link href={`/snapshot/${id}`}>{`ID: ${id}`}</Link>
          </Card.Title>
          { selecting ?
            <div>
              <Button 
                onClick={handleClick} 
                variant={ selected ? 'light' : 'primary'}> { selected ? 'Unselect' : 'Select'
              }</Button>
            </div> : ''
          }
      </Card.Body>
    </Card>
  );
}
