import { MongoClient } from "mongodb";
import mongoose from 'mongoose';

const mongoUri = process.env.MONGODB_URI;
const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true
};

async function mongooseConnect() {
  mongoose.connect(mongoUri, options);
}

// Share MongoDB stuff across modules
export default mongooseConnect;