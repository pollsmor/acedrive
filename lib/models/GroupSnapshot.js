import { Schema, model, models } from 'mongoose';


const GroupSnapshot = new Schema({
    date: { type: String, required: true },
    user: { type: String, required: true }, // Email of the snapshot's creator
    members: {type: [String], required: true, default: []}
})

// Or statement needed to deal with hot reloading
module.exports = models.GroupSnapshot || model('GroupSnapshot', GroupSnapshot)