import { Card } from 'react-bootstrap';
import Link from 'next/link';

export default function SnapshotCard(props) {
  const id = props.id;
  const position = props.position;
  const type = props.isGroupSnapshot ? 'groupsnapshot' : 'snapshot';

  return (
    <Card
      className='my-3'
    >
      <Card.Body>
          <Card.Title>
            <Link href={`/${type}/${id}`}>
              {`${props.position + 1}. ${id}`}
            </Link>
          </Card.Title>
      </Card.Body>
    </Card>
  );
}
