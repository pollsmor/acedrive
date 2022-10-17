import { Schema, model, models } from 'mongoose';
import Permission from './Permission';

const File = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  mimeType: { type: String, required: true },
  isFolder: { type: Boolean, required: true },
  modifiedTime: { type: String, required: true }, // Date string to be parsed
  path: {type: String, required: true},
  parents: { type: [String] }, // Parent folder, if applicable
  thumbnailLink: { type: String },
  sharingUser: { type: Object }, // same object as returned by googleapi
  owners: { type: [Object] }, // objects as returned by googleapi
  driveId: { type: String }, // id of shared drive the file came from 
  driveName: {type: String, default: "MyDrive"}, // name of the shared drive, or "MyDrive"
  permissions: { type: [Permission.schema], default: [] }, // Not present for shared drive item
  content: {type: Object} // present regardless of whether file or folder, but empty for plain files
});

// Or statement needed to deal with hot reloading
module.exports = models.File || model('File', File);