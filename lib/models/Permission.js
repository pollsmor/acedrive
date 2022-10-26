import { Schema, model, models } from 'mongoose';

const Permission = new Schema({
  email: { type: String },
  type: { type: String, required: true }, // Who this applies to (user, group, domain, etc)
  role: { type: String, required: true }, // Is "reader", "writer", or "owner"
  domain: { type: String },
  permissionDetails: { type: Object } // Only for shared drive items, contains info like whether it's inherited or not
});

// Or statement needed to deal with hot reloading
module.exports = models.Permission || model('Permission', Permission);