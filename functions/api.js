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
console.log(keys)

router.get('/', async(req, res) => {
    try{
        const auth_new = new google.auth.GoogleAuth({
            keyFile: "./secretcred.json",
            scopes: 'https://www.googleapis.com/auth/spreadsheets'
        });

        const client = await auth_new.getClient()

        const googleSheets = google.sheets({
            version:"v4",
            auth:client,
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

        console.log([msg_name,msg_content])

        const client = auth.fromJSON(keys);
        client.scopes=['https://www.googleapis.com/auth/spreadsheets'];

        const googleSheets = google.sheets({
            version:"v4",
            auth:client,
        });

        if(msg_name!=""){

        
        const sendData = await googleSheets.spreadsheets.values.append({
            auth,
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

app.use('/.netlify/functions/api',router);
module.exports.handler = serverless(app);