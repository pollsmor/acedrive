import { Card } from 'react-bootstrap';
import Link from 'next/link';

export default function SnapshotCard(props) {
  const id = props.id;
  const position = props.position;

  return (
    <Card
      className='my-3'
      style={{ width: '22rem' }} 
    >
      <Card.Body>
          <Card.Title>
            <Link href={`/snapshot/${id}`}>{`${position + 1}. ${id}`}</Link>
          </Card.Title>
      </Card.Body>
    </Card>
  );
}
