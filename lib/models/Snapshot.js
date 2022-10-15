import { Schema, model, models } from 'mongoose';
import File from './File';

const Snapshot = new Schema({
    date: {type: String, required: true},
    // user will be the email of the snapshot creator
    user: {type: String, required: true},
    files: {type: [File.schema], required: true, default: []}
})

// Or statement needed to deal with hot reloading
module.exports = models.Snapshot || model('Snapshot', Snapshot)