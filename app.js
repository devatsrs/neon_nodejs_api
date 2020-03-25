const  express = require('express');

const mysql = require('mysql');

const bodyParser = require('body-parser');
//var compression = require('compression');

// create connection
const db = mysql.createConnection({
    host        : '172.16.1.175',
    user        : 'cluster-user',
    password    : 'clusterpass',
    database    : 'speakintelligentRoutingEngine',
    port        : 3306

});

/* const db = mysql.createConnection({
 host        : 'localhost',
 user        : 'root',
 password   : 'root',
 database    : 'speakIntelligentRoutingEngine',
 port        : 3306

 }); */

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
app.use((err, req, res, next) => {
    // you can error out to stderr still, or not; your choice
    console.error(err);

    // body-parser will set this to 400 if the json is in error
    if(err.status === 400)
        return res.status(err.status).send({ErrorMessage: 'Invalid Request'});

    return next(err); // if it's not a 400, let the default error handling do it.
});

app.use('/api/', function(req, res, next) {

    if (!req.is('application/json'))
        return res.status(400).send({ErrorMessage: "Invalid Request"});

    next();
});
//get post data
app.post('/api/route',   (req, res) => {


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
    var error = {};
    var p_OriginationNo = null;
    var p_AccountNo = '';
    var p_AccountID = 0;
    var p_AccountDynamicField = '';
    var p_AccountDynamicFieldValue = '';
    var p_Location = '';
    var p_APICountry = '';


    if(typeof req.body.OriginationNo != 'undefined' && req.body.OriginationNo != ''){
        p_OriginationNo  = req.body.OriginationNo;
    }

    if(typeof req.body.DestinationNo == 'undefined' || req.body.DestinationNo == ''){
        error.ErrorMessage = 'Destination No is required.';
    }else{
        var p_DestinationNo  = req.body.DestinationNo;
    }

    if(typeof req.body.Location != 'undefined' && req.body.Location != ''){
        p_Location  = req.body.Location;
    }

    if(typeof req.body.CountryName != 'undefined' && req.body.CountryName != ''){
        p_APICountry  = req.body.CountryName;
    }

    if(typeof req.body.AccountNo != 'undefined' && req.body.AccountNo != ''){
        p_AccountNo  = req.body.AccountNo;

    } else if (typeof req.body.AccountID != 'undefined' && req.body.AccountID != ''){

        if (isNaN(req.body.AccountID) == true) {
            error.ErrorMessage = 'AccountID type must be integer.';
        } else {
            p_AccountID  = req.body.AccountID;
        }

    } else if (typeof req.body.AccountDynamicField  != 'undefined' && typeof req.body.AccountDynamicField[0].Name  != 'undefined' && req.body.AccountDynamicField[0].Name != ''){

        p_AccountDynamicField  = req.body.AccountDynamicField[0].Name;

        if (typeof req.body.AccountDynamicField  != 'undefined' &&  typeof req.body.AccountDynamicField[0].Value  != 'undefined' && req.body.AccountDynamicField[0].Value != ''){

            if(req.body.AccountDynamicField[0].Name == 'CustomerID'){
                p_AccountDynamicFieldValue  = req.body.AccountDynamicField[0].Value;
            }

        } else {
            error.ErrorMessage = 'Account field value is required';
        }

    } else {
        error.ErrorMessage = 'Account field is required';
    }

    if(Object.keys(error).length > 0){
        res.status(400).send(error);
    } else {
        let sql = `call prc_RoutingByAccOriDestLoc('${p_OriginationNo}','${p_DestinationNo}','${p_AccountNo}','${p_AccountID}','${p_AccountDynamicField}','${p_AccountDynamicFieldValue}','${p_Location}','${p_APICountry}' );`;
        /* res.send(sql);
         return;
         */
        db.query(sql, (err, results) => {
            if (err) {
                error.ErrorMessage = 'Something Went Wrong.';
                res.status(500).send(error);
                throw err;
            } else {
                var message1 = '';
                Object.keys(results[0]).forEach(function (key) {
                    var row = results[0][key];
                    message1 = row.ErrorMessage;
                });
                if (message1 != '' && typeof(message1) != "undefined") {
                    res.status(400).send(results[0][0]);
                } else {
                    res.status(200).send(results[0]);
                }
            }
        });
    }
});

//get post data
app.post('/api/checkBalance',   (req, res) => {
    var p_AccountNo = '';
    var p_AccountID = 0;
    var p_AccountDynamicField = '';
    var p_AccountDynamicFieldValue = '';
    var error = {};

    if(typeof req.body.AccountNo != 'undefined'){
        p_AccountNo  = req.body.AccountNo;

    }else if (typeof req.body.AccountID != 'undefined'){

        if (isNaN(req.body.AccountID) == true) {
            error.ErrorMessage = 'AccountID type must be integer.';
        } else {
            p_AccountID = req.body.AccountID;
        }

    }else if (typeof req.body.AccountDynamicField  != 'undefined' &&  typeof req.body.AccountDynamicField[0].Name  != 'undefined' ){
        p_AccountDynamicField  = req.body.AccountDynamicField[0].Name;

        if (typeof req.body.AccountDynamicField  != 'undefined' &&  typeof req.body.AccountDynamicField[0].Value  != 'undefined' ){
            p_AccountDynamicFieldValue  = req.body.AccountDynamicField[0].Value;
        }
    }
    let sql = `call prc_getAccountBalance('${p_AccountID}' ,'${p_AccountNo}','${p_AccountDynamicField}','${p_AccountDynamicFieldValue}');`;
    /* res.send(sql);
     return;
     */

    if(Object.keys(error).length > 0){
        res.status(400).send(error);
    } else {
        db.query(sql, (err, results) => {
            if (err) {
                error.ErrorMessage = 'Something Went Wrong.';
                res.status(500).send(error);
                throw err;
            } else {
                var message1 = '';
                Object.keys(results[0]).forEach(function (key) {
                    var row = results[0][key];
                    message1 = row.ErrorMessage;
                });
                if (message1 != '' && typeof(message1) != "undefined") {
                    res.status(400).send(results[0][0]);
                } else {
                    res.status(200).send(results[0][0]);
                }
            }
        });
    }
});

app.post('/api/startCall',   (req, res) => {

    var p_AccountNo = '';
    var p_AccountID = 0;
    var p_AccountDynamicField = '';
    var p_AccountDynamicFieldValue = '';
    var error = {};
    var p_CallType = '';

    if(typeof req.body.AccountNo != 'undefined'){
        p_AccountNo  = req.body.AccountNo;

    }else if (typeof req.body.AccountID != 'undefined'){

        if (isNaN(req.body.AccountID) == true) {
            error.ErrorMessage = 'AccountID type must be integer.';
        } else {
            p_AccountID = req.body.AccountID;
        }

    }else if (typeof req.body.AccountDynamicField  != 'undefined' &&  typeof req.body.AccountDynamicField[0].Name  != 'undefined' ){
        p_AccountDynamicField  = req.body.AccountDynamicField[0].Name;

        if (typeof req.body.AccountDynamicField  != 'undefined' &&  typeof req.body.AccountDynamicField[0].Value  != 'undefined' ){
            p_AccountDynamicFieldValue  = req.body.AccountDynamicField[0].Value;
        }
    }

    if(typeof req.body.UUID == 'undefined' || req.body.UUID == ''){
        error.ErrorMessage = 'UUID is required.';
    }else{
        var p_UUID = req.body.UUID;
    }
    /*
     if(typeof req.body.ConnectTime == 'undefined' || req.body.ConnectTime == ''){
     error.ErrorMessage = 'ConnectTime is required.'
     }else{
     var p_ConnectTime = req.body.ConnectTime;
     }*/

    if(typeof req.body.CLI == 'undefined' || req.body.CLI == ''){
        error.ErrorMessage = 'CLI is required.'
    }else{
        var p_CLI = req.body.CLI;
    }

    if(typeof req.body.CLD == 'undefined' || req.body.CLD == ''){
        error.ErrorMessage = 'CLD is required.'
    }else{
        var p_CLD = req.body.CLD;
    }

    if(typeof req.body.ServiceNumber == 'undefined' || req.body.ServiceNumber == ''){
        error.ErrorMessage = 'ServiceNumber is required.'
    }else{
        var p_ServiceNumber = req.body.ServiceNumber;
    }

    if(typeof req.body.CallType != 'undefined' && req.body.CallType == 0){
        p_CallType = 'Inbound';
    }else if(typeof req.body.CallType != 'undefined' && req.body.CallType == 1){
        p_CallType = 'Outbound';
    }else{
        error.ErrorMessage = 'CallType is required.'
    }

    if (typeof req.body.VendorID != 'undefined' && req.body.VendorID != '') {

        if (isNaN(req.body.VendorID) == true) {
            error.ErrorMessage = 'VendorID type must be integer.';
        } else {
            p_VendorID = req.body.VendorID;
        }

    } else {
        p_VendorID = 0;
    }

    if (typeof req.body.VendorConnectionName != 'undefined' && req.body.VendorConnectionName != '') {
        p_VendorConnectionName = req.body.VendorConnectionName;
    } else {
        p_VendorConnectionName = '';
    }

    if (typeof req.body.OriginType != 'undefined' && req.body.OriginType != '') {
        p_OriginType = req.body.OriginType;
    } else {
        p_OriginType = '';
    }

    if (typeof req.body.OriginProvider != 'undefined' && req.body.OriginProvider != '') {
        p_OriginProvider = req.body.OriginProvider;
    } else {
        p_OriginProvider = '';
    }
    if (typeof req.body.VendorRate != 'undefined' && req.body.VendorRate != '') {

        if (isNaN(req.body.VendorRate) == true) {
            error.ErrorMessage = 'VendorRate type must be decimal.';
        } else {
            p_VendorRate = req.body.VendorRate;
        }

    } else {
        p_VendorRate = 0;
    }

    if (typeof req.body.VendorCLIPrefix != 'undefined' && req.body.VendorCLIPrefix != '') {
        p_VendorCLIPrefix = req.body.VendorCLIPrefix;
    } else {
        p_VendorCLIPrefix = 'Other';
    }

    if (typeof req.body.VendorCLDPrefix != 'undefined' && req.body.VendorCLDPrefix != '') {
        p_VendorCLDPrefix = req.body.VendorCLDPrefix;
    } else {
        p_VendorCLDPrefix = 'Other';
    }

    if(Object.keys(error).length > 0){
        res.status(400).send(error);
    }else {

        db.beginTransaction(function(err) {
            if (err) {
                error.ErrorMessage = 'Something Went Wrong.';
                res.status(500).send(error);
                throw err;
            }else {
                let sql = `CALL prc_startCall('${p_AccountID}','${p_AccountNo}','${p_AccountDynamicField}','${p_AccountDynamicFieldValue}','${p_UUID}','${p_CLI}','${p_CLD}','${p_ServiceNumber}','${p_CallType}','${p_VendorID}','${p_VendorConnectionName}','${p_OriginType}','${p_OriginProvider}','${p_VendorRate}','${p_VendorCLIPrefix}' ,'${p_VendorCLDPrefix}');`;
                /* res.send(sql);
                 return;
                 */
                db.query(sql, (err, results) => {
                    if (err) {
                        db.rollback(function () {
                            error.ErrorMessage = 'Something Went Wrong.';
                            res.status(500).send(error);
                            throw err;
                        });
                    } else {
                        var message1 = '';
                        Object.keys(results[0]).forEach(function (key) {
                            var row = results[0][key];
                            message1 = row.ErrorMessage;
                        });
                        if (message1 != '' && typeof(message1) != "undefined") {
                            db.rollback(function () {
                                res.status(400).send(results[0][0]);
                            });
                        } else {
                            db.commit(function (err) {
                                if (err) {
                                    db.rollback(function () {
                                        error.ErrorMessage = 'Something Went Wrong.';
                                        res.status(500).send(error);
                                        throw err;
                                    });
                                } else {
                                    res.status(200).send(results[0][0]);
                                }

                            });
                        }
                    }

                });
            }

        });
    }


});

app.post('/api/startRecording', (req, res) => {

    var error = {};
    var p_AccountNo = '';
    var p_AccountID = 0;
    var p_AccountDynamicField = '';
    var p_AccountDynamicFieldValue = '';

    if(typeof req.body.AccountNo != 'undefined'){
        p_AccountNo  = req.body.AccountNo;

    }else if (typeof req.body.AccountID != 'undefined'){

        if (isNaN(req.body.AccountID) == true) {
            error.ErrorMessage = 'AccountID type must be integer.';
        } else {
            p_AccountID = req.body.AccountID;
        }

    }else if (typeof req.body.AccountDynamicField  != 'undefined' &&  typeof req.body.AccountDynamicField[0].Name  != 'undefined' ){
        p_AccountDynamicField  = req.body.AccountDynamicField[0].Name;

        if (typeof req.body.AccountDynamicField  != 'undefined' &&  typeof req.body.AccountDynamicField[0].Value  != 'undefined' ){
            p_AccountDynamicFieldValue  = req.body.AccountDynamicField[0].Value;
        }
    }

    if(typeof req.body.UUID == 'undefined' || req.body.UUID == ''){
        error.ErrorMessage = 'UUID is required.';
    }else{
        var p_UUID = req.body.UUID;
    }
    /*
     if(typeof req.body.CallRecordingStartTime == 'undefined' || req.body.CallRecordingStartTime == ''){
     error.ErrorMessage = 'CallRecording StartTime is required.'
     }else{
     var p_CallRecordingStartTime = req.body.CallRecordingStartTime;
     }*/

    if(Object.keys(error).length > 0){
        res.status(400).send(error);
    }else {
        db.beginTransaction(function(err) {
            if (err) {
                error.ErrorMessage = 'Something Went Wrong.';
                res.status(500).send(error);
                throw err;
            }else {
                let sql = `call prc_startApiCallRecording('${p_AccountID}' ,'${p_AccountNo}','${p_AccountDynamicField}','${p_AccountDynamicFieldValue}','${p_UUID}');`;
                /* res.send(sql);
                 return;
                 */
                db.query(sql, (err, results) => {
                    if (err) {
                        db.rollback(function () {
                            error.ErrorMessage = 'Something Went Wrong.';
                            res.status(500).send(error);
                            throw err;
                        });
                    }else {
                        db.commit(function (err) {
                            if (err) {
                                db.rollback(function () {
                                    error.ErrorMessage = 'Something Went Wrong.';
                                    res.status(500).send(error);
                                    throw err;
                                });
                            } else {
                                var message1 = '';
                                if (typeof(results[0]) != "undefined" && Object.keys(results[0]).length > 0) {
                                    Object.keys(results[0]).forEach(function (key) {
                                        var row = results[0][key];
                                        message1 = row.ErrorMessage;
                                    });
                                }
                                if (message1 != '' && typeof(message1) != "undefined") {
                                    res.status(400).send(results[0][0]);
                                } else {
                                    res.status(200).send({});
                                }
                            }
                        });
                    }

                });
            }
        });
    }

});


app.get('/health_check',   (req, res) => {
    var ip = require("ip");
    let sql = "SELECT * FROM speakintelligentRM.tblNode WHERE `LocalIP` = '" + ip.address() + "' LIMIT 1";
    //console.log(sql);
    var error= {};
    db.query(sql , (err, results) => {
        if(err) {
            error.ErrorMessage = 'Something Went Wrong.';
            res.status(500).send(error);
            throw err;
        } else {
            var message1 = '';
            if (typeof(results[0]) != "undefined" && Object.keys(results[0]).length > 0) {
                Object.keys(results[0]).forEach(function (key) {
                    var row = results[0][key];
                    message1 = row.ErrorMessage;
                });
                if (message1 != '' && typeof(message1) != "undefined") {
                    error.ErrorMessage = 'Something Went Wrong.';
                    res.status(400).send(error);
                } else {
                    var MaintainceMode = results[0]['MaintananceStatus'];
                    if(MaintainceMode == 1){
                        error.ErrorMessage = 'Server In Maintenance';
                        res.status(404).send(error);
                    } else {
                        res.status(200).send([]);
                    }
                }
            } else {
                error.ErrorMessage = 'Something Went Wrong.';
                res.status(404).send(error);
            }
        }
    });
});


app.post('/api/endCall',   (req, res) => {

    var error = {};
    var p_AccountNo = '';
    var p_AccountID = 0;
    var p_AccountDynamicField = '';
    var p_AccountDynamicFieldValue = '';

    if(typeof req.body.AccountNo != 'undefined'){
        p_AccountNo  = req.body.AccountNo;

    }else if (typeof req.body.AccountID != 'undefined'){

        if (isNaN(req.body.AccountID) == true) {
            error.ErrorMessage = 'AccountID type must be integer.';
        } else {
            p_AccountID = req.body.AccountID;
        }

    } else if (typeof req.body.AccountDynamicField  != 'undefined' &&  typeof req.body.AccountDynamicField[0].Name  != 'undefined' ){
        p_AccountDynamicField  = req.body.AccountDynamicField[0].Name;

        if (typeof req.body.AccountDynamicField  != 'undefined' &&  typeof req.body.AccountDynamicField[0].Value  != 'undefined' ){
            p_AccountDynamicFieldValue  = req.body.AccountDynamicField[0].Value;
        }
    }

    if(typeof req.body.UUID == 'undefined' || req.body.UUID == ''){
        error.ErrorMessage = 'UUID is required.';
    }else{
        var p_UUID = req.body.UUID;
    }
    /*
     if(typeof req.body.DisconnectTime == 'undefined' || req.body.DisconnectTime == ''){
     error.ErrorMessage = 'DisconnectTime is required.';
     }else{
     var p_DisconnectTime = req.body.DisconnectTime;
     }*/

    if(Object.keys(error).length > 0){
        res.status(400).send(error);
    }else {
        db.beginTransaction(function(err) {
            if (err) {
                error.ErrorMessage = 'Something Went Wrong.';
                res.status(500).send(error);
                throw err;
            }else {
                let sql = `call prc_endApiCall('${p_AccountID}' ,'${p_AccountNo}','${p_AccountDynamicField}','${p_AccountDynamicFieldValue}','${p_UUID}');`;
                /* res.send(sql);
                 return;
                 */
                db.query(sql, (err, results) => {
                    if (err) {
                        db.rollback(function () {
                            error.ErrorMessage = 'Something Went Wrong.';
                            res.status(500).send(error);
                            throw err;
                        });
                    }else {
                        db.commit(function (err) {
                            if (err) {
                                db.rollback(function () {
                                    error.ErrorMessage = 'Something Went Wrong.';
                                    res.status(500).send(error);
                                    throw err;
                                });
                            } else {
                                var message1 = '';
                                Object.keys(results[0]).forEach(function (key) {
                                    var row = results[0][key];
                                    message1 = row.ErrorMessage;
                                });
                                if (message1 != '' && typeof(message1) != "undefined") {
                                    res.status(400).send(results[0][0]);
                                } else {
                                    res.status(200).send(results[0][0]);
                                }
                            }
                        });
                    }
                });
            }
        });
    }

});

app.post('/api/blockCall',   (req, res) => {

    var error = {};
    var p_AccountNo = '';
    var p_AccountID = 0;
    var p_AccountDynamicField = '';
    var p_AccountDynamicFieldValue = '';
    var p_DisconnectTime = '';
    var p_BlockReason = '';

    if(typeof req.body.AccountNo != 'undefined'){
        p_AccountNo  = req.body.AccountNo;

    }else if (typeof req.body.AccountID != 'undefined'){

        if (isNaN(req.body.AccountID) == true) {
            error.ErrorMessage = 'AccountID type must be integer.';
        } else {
            p_AccountID = req.body.AccountID;
        }

    } else if (typeof req.body.AccountDynamicField  != 'undefined' &&  typeof req.body.AccountDynamicField[0].Name  != 'undefined' ){
        p_AccountDynamicField  = req.body.AccountDynamicField[0].Name;

        if (typeof req.body.AccountDynamicField  != 'undefined' &&  typeof req.body.AccountDynamicField[0].Value  != 'undefined' ){
            p_AccountDynamicFieldValue  = req.body.AccountDynamicField[0].Value;
        }
    }

    if(typeof req.body.UUID == 'undefined' || req.body.UUID == ''){
        error.ErrorMessage = 'UUID is required.';
    }else{
        var p_UUID = req.body.UUID;
    }
    /*
     if(typeof req.body.DisconnectTime == 'undefined' || req.body.DisconnectTime == ''){
     error.ErrorMessage = 'DisconnectTime is required.';
     }else{
     p_DisconnectTime = req.body.DisconnectTime;
     }*/

    if(typeof req.body.BlockReason == 'undefined' || req.body.BlockReason == ''){
        p_BlockReason = '';
    }else{
        p_BlockReason = req.body.BlockReason;
    }

    if(Object.keys(error).length > 0){
        res.status(400).send(error);
    }else {
        db.beginTransaction(function(err) {
            if (err) {
                error.ErrorMessage = 'Something Went Wrong.';
                res.status(500).send(error);
                throw err;
            }else {
                let sql = `call prc_blockApiCall('${p_AccountID}' ,'${p_AccountNo}','${p_AccountDynamicField}','${p_AccountDynamicFieldValue}','${p_UUID}','${p_BlockReason}');`;
                /* res.send(sql);
                 return;
                 */
                db.query(sql, (err, results) => {
                    if (err) {
                        db.rollback(function () {
                            error.ErrorMessage = 'Something Went Wrong.';
                            res.status(500).send(error);
                            throw err;
                        });
                    } else {
                        db.commit(function (err) {
                            if (err) {
                                db.rollback(function () {
                                    error.ErrorMessage = 'Something Went Wrong.';
                                    res.status(500).send(error);
                                    throw err;
                                });
                            } else {

                                var message1 = '';
                                Object.keys(results[0]).forEach(function (key) {
                                    var row = results[0][key];
                                    message1 = row.ErrorMessage;
                                });
                                if (message1 != '' && typeof(message1) != "undefined") {
                                    res.status(400).send(results[0][0]);
                                } else {
                                    res.status(200).send(results[0][0]);
                                }
                            }

                        });
                    }

                });
            }
        });
    }

});

app.post('/api/ImportCDR',   (req, res) => {

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

    var error = {};
    var p_CallType = '';
    var p_CallRecording = 0;
    var p_CallRecordingStartTime = '0000-00-00 00:00:00';

    if(typeof req.body.UUID == 'undefined' || req.body.UUID == ''){
        error.ErrorMessage = 'UUID is required.';
    }else{
        var p_UUID = req.body.UUID;
    }
    if(typeof req.body.ConnectTime == 'undefined' || req.body.ConnectTime == ''){
        error.ErrorMessage = 'ConnectTime is required.'
    }else{
        var p_ConnectTime = req.body.ConnectTime;
    }

    if(typeof req.body.DisconnectTime == 'undefined' || req.body.DisconnectTime == ''){
        error.ErrorMessage = 'DisconnectTime is required.'
    }else{
        var p_DisconnectTime = req.body.DisconnectTime;
    }

    if(typeof req.body.CLI == 'undefined' || req.body.CLI == ''){
        error.ErrorMessage = 'CLI is required.'
    }else{
        var p_CLI = req.body.CLI;
    }

    if(typeof req.body.CLD == 'undefined' || req.body.CLD == ''){
        error.ErrorMessage = 'CLD is required.'
    }else{
        var p_CLD = req.body.CLD;
    }

    if(typeof req.body.ServiceNumber == 'undefined' || req.body.ServiceNumber == ''){
        error.ErrorMessage = 'ServiceNumber is required.'
    }else{
        var p_ServiceNumber = req.body.ServiceNumber;
    }

    if(typeof req.body.CallType != 'undefined' && req.body.CallType == 0){
        p_CallType = 'Inbound';
    }else if(typeof req.body.CallType != 'undefined' && req.body.CallType == 1){
        p_CallType = 'Outbound';
    }else{
        error.ErrorMessage = 'CallType is required.'
    }

    if(typeof req.body.CallRecording != 'undefined' && req.body.CallRecording == 1 && typeof req.body.CallRecordingStartTime != 'undefined'){
        p_CallRecordingStartTime = req.body.CallRecordingStartTime;
        p_CallRecording = 1;
    }

    if (typeof req.body.VendorID != 'undefined' && req.body.VendorID != '') {
        p_VendorID = req.body.VendorID;
    } else {
        p_VendorID = 0;
    }

    if (typeof req.body.VendorConnectionName != 'undefined' && req.body.VendorConnectionName != '') {
        p_VendorConnectionName = req.body.VendorConnectionName;
    } else {
        p_VendorConnectionName = '';
    }

    if (typeof req.body.OriginType != 'undefined' && req.body.OriginType != '') {
        p_OriginType = req.body.OriginType;
    } else {
        p_OriginType = '';
    }

    if (typeof req.body.OriginProvider != 'undefined' && req.body.OriginProvider != '') {
        p_OriginProvider = req.body.OriginProvider;
    } else {
        p_OriginProvider = '';
    }
    if (typeof req.body.VendorRate != 'undefined' && req.body.VendorRate != '') {
        p_VendorRate = req.body.VendorRate;
    } else {
        p_VendorRate = 0;
    }

    if (typeof req.body.VendorCLIPrefix != 'undefined' && req.body.VendorCLIPrefix != '') {
        p_VendorCLIPrefix = req.body.VendorCLIPrefix;
    } else {
        p_VendorCLIPrefix = 'Other';
    }

    if (typeof req.body.VendorCLDPrefix != 'undefined' && req.body.VendorCLDPrefix != '') {
        p_VendorCLDPrefix = req.body.VendorCLDPrefix;
    } else {
        p_VendorCLDPrefix = 'Other';
    }

    if(Object.keys(error).length > 0){
        res.status(400).send(error);
    }else {
        db.beginTransaction(function(err) {
            if (err) {
                error.ErrorMessage = 'Something Went Wrong.';
                res.status(500).send(error);
                throw err;
            }else {
                let sql = `CALL prc_insertPostpaidApiCall('${p_AccountID}','${p_AccountNo}','${p_AccountDynamicField}','${p_AccountDynamicFieldValue}','${p_UUID}','${p_ConnectTime}','${p_DisconnectTime}','${p_CLI}','${p_CLD}','${p_ServiceNumber}','${p_CallType}','${p_VendorID}','${p_VendorConnectionName}','${p_OriginType}','${p_OriginProvider}','${p_VendorRate}','${p_VendorCLIPrefix}' ,'${p_VendorCLDPrefix}','${p_CallRecording}','${p_CallRecordingStartTime}');`;
                /* res.send(sql);
                 return;
                 */
                db.query(sql, (err, results) => {
                    if (err) {
                        db.rollback(function () {
                            error.ErrorMessage = 'Something Went Wrong.';
                            res.status(500).send(error);
                            throw err;
                        });
                    } else {
                        db.commit(function (err) {
                            if (err) {
                                db.rollback(function () {
                                    error.ErrorMessage = 'Something Went Wrong.';
                                    res.status(500).send(error);
                                    throw err;
                                });
                            } else {
                                var message1 = '';
                                Object.keys(results[0]).forEach(function (key) {
                                    var row = results[0][key];
                                    message1 = row.ErrorMessage;
                                });
                                if (message1 != '' && typeof(message1) != "undefined") {
                                    res.status(400).send(results[0][0]);
                                } else {
                                    res.status(200).send(results[0]);
                                }
                            }

                        });
                    }

                });
            }
        });
    }
});
app.listen( 3000 , (err) => {

    if(err) {
        throw err;
    }

    console.log(" Started server on port 3000");

});
//db.end();
