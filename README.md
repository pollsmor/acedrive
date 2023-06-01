# CSE 416: Fall 2022 Project - Cloud Drive Sharing Manager

### Running the development server:
```bash
npm run dev
```

## API routes
The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages. This also stores the necessary files for OAuth2 authentication.

## Environment variables
This project requires the use of a file `.env.local` in the project root, which is not pushed to the repository for obvious reasons. If you are a contributor, contact Kevin Li (kevin.li.7@stonybrook.edu) for the file.

## MongoDB database
To store user information and data pertinent to this project, a local MongoDB instance should suffice for development. For a more permanent solution, we will need a cloud-hosted MongoDB instance.

## Want to test this program?
Because this is an external-facing app that is not reviewed by Google, we must manually add the email of those who wish to use this application. Drop a message to one of the group members, and we'll get it sorted out.

## Deploying to a cloud instance
The only thing that needs to change is to adjust NEXTAUTH_URL to the appropriate link of the cloud server. It would probably also be prudent to build for production rather than for dev with npm.

## Snapshots
For now, a snapshot is analagous to a list of (parsed) files.