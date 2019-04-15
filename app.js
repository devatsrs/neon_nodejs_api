const  express = require('express');

const mysql = require('mysql');

const bodyParser = require('body-parser');

//var compression = require('compression');

// create connection
const db = mysql.createConnection({
    host        : '188.92.57.86',
    user        : 'neon-user',
    password   : 'CYDb3cobrePa!',
    database    : 'speakIntelligentRoutingEngine',
    port        : 13306

});

db.connect( (err) => {

    if(err) {
        console.log('failed to connect mysql...');

        throw err;
    }
    console.log('mysql connected...');

});

const app = express();

//app.use(compression());

app.use(bodyParser.json());


//get post data
app.post('/route',   (req, res) => {


    /*{
        "OriginationNo": "442085950856",
        "DestinationNo": "44208589657",
        "AccountDynamicField": [{"Name": "CustomerID","Value": "666"}],
        "DateAndTime": "2019-01-21 10:44:00",
        "Location": "AM1"
    }

    {
        "OriginationNo": "442085950856",
        "DestinationNo": "44208589657",
        "AccountID": 6,
        "DateAndTime": "2019-01-21 10:44:00",
        "Location": "AM1"
    }

     {
     "OriginationNo": "442085950856",
     "DestinationNo": "44208589657",
     "AccountNo": 6,
     "DateAndTime": "2019-01-21 10:44:00",
     "Location": "AM1"
     }
    */

    var p_OriginationNo  = req.body.OriginationNo;
    var p_DestinationNo  = req.body.DestinationNo;
    var p_DateAndTime  = req.body.DateAndTime;
    var p_Location  = req.body.Location;

 /*   var p_AccountNo  = req.body.AccountNo == undefined ? '': req.body.AccountNo ;
    var p_AccountID  = req.body.AccountID == undefined ? 0: req.body.AccountID ;
    var p_AccountDynamicField  = req.body.AccountDynamicField[0].Name == undefined ? '' : req.body.AccountDynamicField[0].Name ;
    var p_AccountDynamicFieldValue  = req.body.AccountDynamicField[0].Value == undefined ? '' :  req.body.AccountDynamicField[0].Value;
*/
    var p_AccountNo = '';
    var p_AccountID = 0;
    var p_AccountDynamicField = '';
    var p_AccountDynamicFieldValue = '';

    if(typeof req.body.AccountNo != 'undefined'){
        p_AccountNo  = req.body.AccountNo;

    }else if (typeof req.body.AccountID != 'undefined'){
        p_AccountID  = req.body.AccountID;

    }else if (typeof req.body.AccountDynamicField  != 'undefined' &&  typeof req.body.AccountDynamicField[0].Name  != 'undefined' ){
        p_AccountDynamicField  = req.body.AccountDynamicField[0].Name;

        if (typeof req.body.AccountDynamicField  != 'undefined' &&  typeof req.body.AccountDynamicField[0].Value  != 'undefined' ){
            p_AccountDynamicFieldValue  = req.body.AccountDynamicField[0].Value;
        }
    }



    let sql = `call prc_RoutingByAccOriDestLoc('${p_OriginationNo}','${p_DestinationNo}','${p_DateAndTime}' ,'${p_AccountNo}','${p_AccountID}','${p_AccountDynamicField}','${p_AccountDynamicFieldValue}','${p_Location}' );`;
  /* res.send(sql);
   return;
*/
    db.query(sql , (err, results) => {

        if(err) {
            throw err;
        }

        console.log(results[0]);
        res.send(results[0]);

    });


});


app.listen( 3000 , (err) => {

    if(err) {
        throw err;
    }

    console.log(" Started server on port 3000");

});
//db.end();