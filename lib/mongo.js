import mongoose from 'mongoose';

const mongoUri = process.env.MONGODB_URI;

async function mongooseConnect() {
  mongoose.connect(mongoUri), {
    autoIndex: true // Handle dupes
  };
}

// Share MongoDB stuff across modules
export { mongooseConnect };