import { Schema, model, models } from 'mongoose';
import AccessReq from './AccessReq';
import File from './File';

// A snapshot will be a list of File objects.
const User = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  image: { type: String, required: true },
  queries: { type: [String], default: [] },
  accessReqs: { type: [AccessReq.schema], default: [] },
  // Make sure most recent snapshot is at the front of the array
  snapshots: { type: [[File.schema]], default: [] }
});

// Or statement needed to deal with hot reloading
module.exports = models.User || model('User', User);