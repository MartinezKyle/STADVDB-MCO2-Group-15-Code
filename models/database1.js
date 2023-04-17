const mysql = require('mysql');
const fs = require('fs');
const { deflateSync } = require('zlib');
require('dotenv').config();
const path = require('path');
var isNode1Online = false;

var config = {
    user: process.env.DB_USER1,
    database: process.env.DB_NAME1,
    password: process.env.DB_PASSWORD1,
};

if(process.env.NODE_ENV === 'production') {
  console.log('Running from cloud. Connecting to DB through GCP socket.');
  config.socketPath = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME1}`;
}

else {
  console.log('Running from localhost. Connecting to DB directly.');
  config.host = process.env.DB_HOST1;
}

let connection = mysql.createConnection(config);
module.exports = pool;