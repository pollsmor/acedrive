import { Schema, model, models } from 'mongoose';
import Permission from './Permission';

const File = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  mimeType: { type: String, required: true },
  modifiedTime: { type: String, required: true }, // Date string to be parsed
  path: {type: String, required: true},
  parent: { type: String }, // Parent folder - not present for shared item
  thumbnailLink: { type: String },
  sharingUser: { type: Object }, // same object as returned by googleapi
  owners: { type: [Object] }, // objects as returned by googleapi
  driveId: { type: String }, // id of shared drive the file came from, or MyDrive if not from shared 
  driveName: {type: String, default: "MyDrive"},
  permissions: { type: [Permission.schema], default: [] }, // Not present for shared drive item
  content: {type: Object} // only present for folders
});

// Or statement needed to deal with hot reloading
module.exports = models.File || model('File', File);