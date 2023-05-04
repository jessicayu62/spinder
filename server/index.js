import express from "express";
// import fetch from "node-fetch";
// import config from "../client/src/config.js";

const PORT = process.env.PORT || 3001;

const app = express();

// async function getAccessToken() {
//     const settings = {
//         method: 'POST',
//         headers: {
//             'Accept': 'application/json',
//             'Content-Type': 'application/x-www-form-urlencoded',
//         },
//         body: {
//             'grant_type': 'client_credentials',
//             'client_id': config.CLIENT_ID,
//             'client_secret': config.CLIENT_SECRET,
//         }
        
//     };
//     try {
//         const result = await fetch("https://accounts.spotify.com/api/token", settings)
//         const data = await result.json();
//         return data
//     } catch (e) {
//         console.log(e);
//     }
// }

// app.get("/callback", async (req, res) => {
//     const settings = {
//         method: 'POST',
//         headers: {
//             'Authorization': 'Basic ' + (new Buffer.from(config.CLIENT_ID + ':' + config.CLIENT_SECRET).toString('base64')),
//             'Accept': 'application/json',
//             // 'Content-Type': 'application/x-www-form-urlencoded',
//         },
//         body: {
//             'grant_type': 'client_credentials',
//             // 'client_id': config.CLIENT_ID,
//             // 'client_secret': config.CLIENT_SECRET,
//         }
        
//     };
//     try {
//         const result = await fetch('https://accounts.spotify.com/authorize', settings)
//         const data = await result.json();
//         // return data
//         res.json(data);
//     } catch (e) {
//         console.log(e);
//     }
//   });

// app.get('/callback', async (req, res) => {
//     const body = {
//         grant_type: 'authorization_code',
//         code: req.query.code,
//         redirect_uri: config.REDIRECT_URI,
//         client_id: config.CLIENT_ID,
//         client_secret: config.CLIENT_SECRET,
//       }
    
//       await fetch('https://accounts.spotify.com/api/token', {
//         method: 'POST',
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded",
//           "Accept": "application/json"
//         },
//         body: encodeFormData(body)
//       })
//       .then(response => response.json())
//       .then(data => {
//         const query = querystring.stringify(data);
//         res.redirect(`${config.REDIRECT_URI}?${query}`);
//       });
// });

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});