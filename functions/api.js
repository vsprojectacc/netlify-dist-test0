const express = require('express');
const {google} = require('googleapis');
const serverless = require('serverless-http');
const path = require('path');

const app = express();
const router = express.Router();

app.set('view engine','ejs');
app.set('views',path.join('./src/views'))
app.use(express.static(path.join('./src/public')))
app.use(express.urlencoded({extended:true}))

const SHEET_ID = process.env.SHEET_ID;

const loadpage = router.get('/', async(req, res) => {
    try{
        const auth = new google.auth.GoogleAuth({
            keyFile:process.env.SECRETKEY,
            scopes:"https://www.googleapis.com/auth/spreadsheets",
        });

        const client = await auth.getClient();

        const googleSheets = google.sheets({
            version:"v4",
            auth:client,
        });

        const metaData = await googleSheets.spreadsheets.get({
            auth,
            spreadsheetId: SHEET_ID,
        });

        const getRows = await googleSheets.spreadsheets.values.get({
            auth, 
            spreadsheetId: SHEET_ID,
            range:"Sheet1!A2:B",
        });

        /*** 
        await googleSheets.spreadsheets.values.append({
            auth,
            spreadsheetId: SHEET_ID,
            range:"Sheet1!A2:B",
            valueInputOption:'USER_ENTERED',
            resource:{values:[
                ["Value1","Value2"],
            ],},   
        });
        */

        const outputJSON = JSON.stringify(getRows.data.values);

        res.render('index',{content: 
            outputJSON
        });}
    catch(err){
        console.log(err)
        res.send('ERROR CHECK CONSOLE')
    }
});

const sendpost = router.post('/',async(req,res)=>{
    try{
        var { msg_name, msg_content } = req.body;

        console.log([msg_name,msg_content])

        const auth = new google.auth.GoogleAuth({
            keyFile:"./secretcred.json",
            scopes:"https://www.googleapis.com/auth/spreadsheets",
        });

        const client = await auth.getClient();

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