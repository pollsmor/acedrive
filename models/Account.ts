import { Schema, model, models, Types } from 'mongoose';

interface IAccount {
  provider: string,
  type: string,
  providerAccountId: string,
  access_token: string,
  expires_at: number,
  refresh_token: string,
  scope: string,
  token_type: string,
  id_token: string,
  userId: Types.ObjectId
}

const Account = new Schema({
  provider: String,
  type: String,
  providerAccountId: String,
  access_token: String,
  expires_at: Number,
  refresh_token: String,
  scope: String,
  token_type: String,
  id_token: String,
  userId: Types.ObjectId
})

// Needed workaround to support hot reloading (i.e. React)
let name = 'Account';
module.exports = models[name] ? model(name) : model(name, Account);