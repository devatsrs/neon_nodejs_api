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

    var p_OriginationNo  = req.body.OriginationNo;
    var p_DestinationNo  = req.body.DestinationNo;
    var p_DateAndTime  = req.body.DateAndTime;
    var p_AccountNo  = req.body.AccountNo == undefined ? '': req.body.AccountNo ;
    var p_AccountID  = req.body.AccountID;
    var p_AccountDynamicField  = req.body.OriginationNo == undefined ? '' : req.body.OriginationNo ;
    var p_AccountDynamicFieldValue  = req.body.OriginationNo == undefined ? '' :  req.body.OriginationNo;
    var p_Location  = req.body.Location;


    let sql = `call prc_RoutingByAccOriDestLoc('${p_OriginationNo}','${p_DestinationNo}','${p_DateAndTime}' ,'${p_AccountNo}',${p_AccountID},'${p_AccountDynamicField}','${p_AccountDynamicFieldValue}','${p_Location}' );`;

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