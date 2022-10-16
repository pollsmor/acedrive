import { Schema, model, models } from 'mongoose';

// Role is "reader", "writer", or "owner".
const Permission = new Schema({
  email: { type: String },
  type: {type: String, required: true }, // who does this apply to (user, group, domain, etc)
  role: { type: String, required: true },
  domain: {type: String },
  permissionDetails: {type: Object} // only exists for shared drive items, contains info like whether its inherited or not

});

// Or statement needed to deal with hot reloading
module.exports = models.Permission || model('Permission', Permission);