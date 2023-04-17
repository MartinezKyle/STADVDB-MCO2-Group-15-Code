const mysql = require('mysql');
const fs = require('fs');
const { deflateSync } = require('zlib');
require('dotenv').config();
const path = require('path');
var isNode3Online = false;

var config = {
    user: process.env.DB_USER3,
    database: process.env.DB_NAME3,
    password: process.env.DB_PASSWORD3,
};

if(process.env.NODE_ENV === 'production') {
  console.log('Running from cloud. Connecting to DB through GCP socket.');
  config.socketPath = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME3}`;
}

else {
  console.log('Running from localhost. Connecting to DB directly.');
  config.host = process.env.DB_HOST3;
}

let pool = mysql.createConnection(config);
module.exports = pool;