import axios from 'axios';
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import mongoose from 'mongoose';
import User from '../../../lib/models/User';

const options = {
  useCreateIndeX: true,
  autoIndex: true
}
mongoose.connect(process.env.MONGODB_URI), options; // Options to handles dupes
const scopes = ['openid', 'email', 'profile', 'https://www.googleapis.com/auth/drive'];
const GOOGLE_AUTHORIZATION_URL = 
  'https://accounts.google.com/o/oauth2/v2/auth?' +
  new URLSearchParams({
    prompt: 'consent',
    access_type: 'offline',
    response_type: 'code',
    scope: scopes.join(' ')
  });

// Takes a token, and returns a new, updated token
async function refreshAccessToken(token) {
  let url = 
    'https://oauth2.googleapis.com/token?' +
    new URLSearchParams({
      client_id: process.env.GOOGLE_ID,
      client_secret: process.env.GOOGLE_SECRET,
      grant_type: 'refresh_token',
      refresh_token: token.refreshToken
    });

  let res = await axios.post(url);
  return {
    accessToken: res.data.access_token,
    // Google returns an expires_at attribute set to 3600 seconds.
    accessTokenExpires: Date.now() + res.data.expires_in * 1000,
    refreshToken: token.refreshToken, // Reuse previous refresh token
    user: token.user
  }
}

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      authorization: GOOGLE_AUTHORIZATION_URL
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in, user/account are undefined in the future
      if (account && user) {
        let storedUser = new User(user); // Matches Mongoose model
        storedUser.save(err => {
          if (err) {
            if (err.name === 'MongoServerError') {
              console.log('Account found - using that one.');
            } else console.log(err.toString());
          }
        });

        return {
          accessToken: account.access_token,
          accessTokenExpires: account.expires_at,
          refreshToken: account.refresh_token,
          user: user
        };
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < token.accessTokenExpires) {
;        return token;
      } else { // Access token has expired, refresh it
        console.log('Access token expired - refreshing');
        return refreshAccessToken(token);
      }
    },
    async session({ session, token }) {
      session.user = token.user;
      session.accessToken = token.accessToken;
      return session;
    }
  }
});