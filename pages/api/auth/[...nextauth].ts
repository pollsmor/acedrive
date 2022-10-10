import NextAuth, { NextAuthOptions } from 'next-auth';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import { clientPromise, mongooseConnect } from '../../../lib/mongodb';
import GoogleProvider from 'next-auth/providers/google';
import Account from '../../../models/Account';

mongooseConnect(); // Mongoose supremacy! Native driver inferiority.

const scopes = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/drive'
];
const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      authorization: { params: { 
          scope: scopes.join(' '),
          access_type: 'offline'
      } }
    })
  ],
  adapter: MongoDBAdapter(clientPromise),
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    // Store token from DB into session object
    async session({ session, token }) {
      let userId = token.sub;
      let account = await Account.findOne({ userId: userId });
      let googleToken = { 
        access_token: account.access_token,
        refresh_token: account.refresh_token
      };
      session.token = googleToken;
      return session;
    }
  }
};

export default NextAuth(authOptions);