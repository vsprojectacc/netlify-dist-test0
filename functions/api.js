const express = require('express');
const {google} = require('googleapis');
const serverless = require('serverless-http');
const {auth} = require('google-auth-library');
const path = require('path');

const app = express();
const router = express.Router();

app.set('view engine','ejs');
app.set('views',path.join('./src/views'))
app.use(express.static(path.join('./src/public')))
app.use(express.urlencoded({extended:true}))

const SHEET_ID = process.env.SHEET_ID;

const keysEnvVar = process.env['SECRETKEY'];
const keys = JSON.parse(keysEnvVar);


router.get('/', async(req, res) => {
    try{
        const auth_new = google.auth.fromJSON(keys);
        auth_new.scopes= ['https://www.googleapis.com/auth/spreadsheets'];

        //const client = await auth_new.getClient()

        //console.log(auth_new)

        const googleSheets = google.sheets({
            version:"v4",
            auth:auth_new,
        });

        const metaData = await googleSheets.spreadsheets.get({
            auth:auth_new,
            spreadsheetId: SHEET_ID,
        });

        const getRows = await googleSheets.spreadsheets.values.get({
            auth:auth_new, 
            spreadsheetId: SHEET_ID,
            range:"Sheet1!A2:B",
        });

        const outputJSON = JSON.stringify(getRows.data.values);

        res.render('index',{content: 
            outputJSON
        });}
    catch(err){
        console.log(err)
        res.send('ERROR CHECK CONSOLE')
    }
});

router.post('/',async(req,res)=>{
    try{
        var { msg_name, msg_content } = req.body;

        const authClient = google.auth.fromJSON(keys);
        authClient.scopes = ['https://www.googleapis.com/auth/spreadsheets'];

        //console.log(client)

       // const authClient = await client.getClient();

        const googleSheets = google.sheets({
            version:"v4",
            auth:authClient,
        });

        if(msg_name!=""){

        
        const sendData = await googleSheets.spreadsheets.values.append({
            auth:authClient,
            spreadsheetId: SHEET_ID,
            range:"Sheet1!A2:B",
            valueInputOption:'USER_ENTERED',
            resource:{values:[[msg_name,msg_content]]},   
        });}

        res.render('formSubmit')
    }
    catch(err){
        console.log(err)
        res.send('ERROR CHECK CONSOLE')
    }
});

app.use('/',router);
module.exports.handler = serverless(app);