import { Schema, model, models } from 'mongoose';
import AccessReq from './AccessReq';

const User = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  image: { type: String, required: true },
  queries: { type: [String], default: [] , maxLength: 10 },
  accessReqs: { type: [AccessReq.schema], default: [] },
  // Only save the IDs, then use it to fetch specific snapshot as needed
  snapshotIDs: { type: [String], default: [] }
});

// Or statement needed to deal with hot reloading
module.exports = models.User || model('User', User);