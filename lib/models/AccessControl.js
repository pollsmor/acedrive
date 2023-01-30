import { Schema, model, models } from "mongoose";

const AccessControlSchema = new Schema({
  searchQuery:{ type: String , required: true },
  accessControlQuery: [{ type: String, required: true }],
  userId : { type: Schema.Types.ObjectId, required: true, ref:"User"}
});

module.exports = models.AccessControl || model("AccessControl", AccessControlSchema);