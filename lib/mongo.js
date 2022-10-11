import mongoose from 'mongoose';

const mongoUri = process.env.MONGODB_URI;

async function mongooseConnect() {
  mongoose.connect(mongoUri);
}

// Share MongoDB stuff across modules
export { mongooseConnect };