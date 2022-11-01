import axios from 'axios';
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import AzureADProvider from 'next-auth/providers/azure-ad';
import mongoose from 'mongoose';
import User from '../../../lib/models/User';

const options = {
  useCreateIndex: true,
  autoIndex: true
}
mongoose.connect(process.env.MONGODB_URI), options; // Options to handles dupes
const googleScopes = ['openid', 'email', 'profile', 'https://www.googleapis.com/auth/drive'];
const microsoftScopes = ['openid', 'email', 'profile', 'offline_access', 'files.readwrite.all'];


// Takes a token, and returns a new, updated token
async function refreshAccessToken(token) {
  let params = { grant_type: 'refresh_token', refresh_token: token.refreshToken };
  let endpoint;
  if (token.provider === 'google') {
    endpoint = 'https://oauth2.googleapis.com/token';
    params.client_id = process.env.GOOGLE_ID,
    params.client_secret = process.env.GOOGLE_SECRET
  } else if (token.provider === 'microsoft') {
    endpoint = `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/oauth2/v2.0/token`;
    params.client_id = process.env.MICROSOFT_CLIENT_ID,
    params.client_secret = process.env.MICROSOFT_SECRET
  }

  let res = await axios.post(endpoint, new URLSearchParams(params));
  return {
    provider: token.provider,
    accessToken: res.data.access_token,
    // Google returns an expires_in attribute set to 3600 seconds. For Microsoft, it varies.
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
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
          scope: googleScopes.join(' ')
        }
      }
    }),
    AzureADProvider({
      id: 'microsoft',
      name: 'Microsoft',
      clientId: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_SECRET,
      tenantId: process.env.MICROSOFT_TENANT_ID,
      authorization: {
        params: {
          scope: microsoftScopes.join(' ')
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in, user/account are undefined in the future
      if (account && user) {
        // stonybrook.edu accounts don't have avatars.
        if (account.provider === 'microsoft')
          user.image = 'https://i.imgur.com/4FhvzzY.jpg';

        let storedUser = new User(user); // Matches Mongoose model
        storedUser.save(err => {
          if (err) {
            if (err.name === 'MongoServerError') {
              console.log('Account found - using that one.');
            } else console.log(err.toString());
          }
        });

        return {
          provider: account.provider,
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