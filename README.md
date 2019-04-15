# SI Neon Nodejs API

Installation 
--
npm install pm2 -g

npm install

pm2 start app.js


Few important commands
--------------------------


##### - Kill instances 
* sudo killall -9 nodemon
* sudo killall -9 node

##### - Start app in background

* pm2 start app.js

* pm2 save
* pm2 startup centos   # to start in background even reboot

##### - Restart app 

* pm2 restart app.js

##### - Delete/Stop app in background

* pm2 delete app


Testing
--
````
curl -X POST \
  http://neon.speakintelligence.com/nodejs/2/route \
  -H 'Content-Type: application/json' \
  -H 'Postman-Token: 11b970d6-a19f-48f5-98bf-7b75b90f5156' \
  -H 'cache-control: no-cache' \
  -d '{
    "OriginationNo": "442085950856",
    "DestinationNo": "44208589657",
    "AccountID": 2,
    "DateAndTime": "2019-01-21 10:44:00",
    "Location": "AM1"
}'
````

TODO
--
* Config file for port and db settings
* Separate route files
* Connection close , error fix log.


