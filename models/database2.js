const mysql = require('mysql');
const fs = require('fs');
const { deflateSync } = require('zlib');
require('dotenv').config();
const path = require('path');
var isNode2Online = false;

var config = {
    user: process.env.DB_USER2,
    database: process.env.DB_NAME2,
    password: process.env.DB_PASSWORD2,
};

if(process.env.NODE_ENV === 'production') {
  console.log('Running from cloud. Connecting to DB through GCP socket.');
  config.socketPath = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME2}`;
}

else {
  console.log('Running from localhost. Connecting to DB directly.');
  config.host = process.env.DB_HOST2;
}

let connection = mysql.createConnection(config);
module.exports = pool;