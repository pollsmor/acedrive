import { Schema, model, models } from "mongoose";

const FileHistorySchema = new Schema({
    fileId:{ type: String, required: true, unique: true },
    history: { type: String},
    from: { type : String, required: true},
    nextPageToken : { type: String }

});

module.exports = models.FileHistory || model("FileHistory", FileHistorySchema);