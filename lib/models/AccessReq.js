import { Schema, model, models } from 'mongoose';

const AccessReq = new Schema({
  query: { type: String, required: true },
  allowed_r: { type: [String], default: [] }, // Allowed domains & emails
  allowed_w: { type: [String], default: [] },
  denied_r: { type: [String], default: [] },
  denied_w: { type: [String], default: [] },
  group: { type: Boolean, default: true }
});

module.exports = models.AccessReq || model('AccessReq', AccessReq);