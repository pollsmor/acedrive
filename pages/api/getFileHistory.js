import { google } from "googleapis";
import { getToken } from "next-auth/jwt";
import FileHistory from "../../lib/models/FileHistoryModel";

const auth = new google.auth.OAuth2({
  client_id: process.env.GOOGLE_ID,
  client_secret: process.env.GOOGLE_SECRET,
});
const service = google.driveactivity({version: 'v2', auth});


export default async function getFileHistory(req, res) {
  try {
    const token = await getToken({ req });
    if (token && req.method == "POST") {
      auth.setCredentials({
        access_token: token.accessToken,
      });
  
      const{id, isFolder} = req.query;
      const userId = token.user.id;
      let nextPageToken = req.body?.nextPageToken ? req.body?.nextPageToken : null;
      
      const requestPayload = {
        pageSize:0,
      }
  
      let fileName = `items/${id}`
  
      isFolder == "true" ? requestPayload.ancestorName = fileName : requestPayload.itemName  = fileName;
      nextPageToken && (requestPayload.pageToken = nextPageToken);
  
      const savedFileHistory = await FileHistory.find({fileId: `${id}~${userId}`});
      

      if(savedFileHistory.length > 0 && !nextPageToken){
        requestPayload.filter = `time > ${new Date(savedFileHistory[0].from).getTime()}`
      }

      console.log(requestPayload)

      const googleRes = await service.activity.query(requestPayload);
        

      if(!savedFileHistory.length > 0 && googleRes.data.activities){
        const addData = await FileHistory.create({
          fileId : `${id}~${userId}`,
          history: JSON.stringify(googleRes.data.activities),
          from: new Date().toISOString(),
          nextPageToken : googleRes.data?.nextPageToken
        })
      }else{
        const savedActivity = JSON.parse(savedFileHistory[0].history);
        if(!nextPageToken){
          const updateData = googleRes.data.activities &&  await FileHistory.findOneAndUpdate({fileId : `${id}~${userId}`},{
            history : JSON.stringify(googleRes.data.activities.concat(savedActivity)),
            from : new Date().toISOString()
          }) 
        }else{
          const updateData = googleRes.data.activities &&  await FileHistory.findOneAndUpdate({fileId : `${id}~${userId}`},{
            history : JSON.stringify(savedActivity.concat(googleRes.data.activities)),
            nextPageToken : googleRes.data?.nextPageToken
          }) 
        }
      }

      const dataFromDb = await FileHistory.find({fileId: `${id}~${userId}`})
  
      nextPageToken =dataFromDb[0].nextPageToken;
      let activityData = JSON.parse(dataFromDb[0].history);
  
      res.json({ activityData : activityData, nextPageToken: nextPageToken });
    } else {
      res.json({
        status: "error",
        msg: "Invalid authentication.",
      });
    }
  } catch (error) {
    console.log(error)
    res.json({
      status: "error",
      msg:"Something Went Wrong"
    })
  }
}