import { Schema, model, models } from 'mongoose';
import Permission from './Permission';

const File = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  mimeType: { type: String, required: true },
  parent: { type: String }, // Parent folder - not present for shared item
  webViewLink: { type: String, required: true },
  iconLink: { type: String, required: true },
  modifiedTime: { type: String, required: true }, // Date string to be parsed
  sharingUser: { type: String }, // Email
  owner: { type: String }, // Email - everyone is owner in shared drive
  teamDriveId: { type: String },
  permissions: { type: [Permission.schema], default: [] } // Not present for shared drive item
});

// Or statement needed to deal with hot reloading
module.exports = models.File || model('File', File);