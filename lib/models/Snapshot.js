import { Schema, model, models } from "mongoose";
import File from "./File";

const Snapshot = new Schema({
  date: { type: String, required: true },
  user: { type: String, required: true }, // Email of the snapshot's creator
  files: { type: [File.schema], default: [] },
  provider: { type: String, required: true }, // "google" or "microsoft"
});

// Or statement needed to deal with hot reloading
module.exports = models.Snapshot || model("Snapshot", Snapshot);
