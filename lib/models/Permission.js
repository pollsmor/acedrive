import { Schema, model, models } from 'mongoose';

// Role is "reader", "writer", or "owner".
const Permission = new Schema({
  email: { type: String, required: true },
  role: { type: String, required: true }
});

// Or statement needed to deal with hot reloading
module.exports = models.Permission || model('Permission', Permission);