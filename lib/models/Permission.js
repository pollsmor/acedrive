import { Schema, model, models } from "mongoose";

const Permission = new Schema({
  email: { type: String },
  type: { type: String, required: true }, // Who this applies to (user, group, domain, etc)
  role: { type: String, required: true }, // Is "reader", "writer", or "owner"
  domain: { type: String },
  permissionDetails: { type: Object },
  isInherited: { type: Boolean }, // not always strictly correct -> permissions that are inherited and directly assigned will only be listed inherited
});

// Or statement needed to deal with hot reloading
module.exports = models.Permission || model("Permission", Permission);
