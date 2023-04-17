const mysql = require('mysql');
const fs = require('fs');
const { deflateSync } = require('zlib');
require('dotenv').config();
const path = require('path');
var isNode2Online = true;

if(process.env.NODE_ENV === 'production') {
    console.log('Running from cloud. Connecting to DB through GCP socket.');
    config.socketPath = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`;
}
else {
    console.log('Running from localhost. Connecting to DB directly.');
    config.host = process.env.DB_HOST1;
}

const pool = mysql.createConnection ({
    host: process.env.DB_HOST2,
    user: process.env.DB_USER2,
    password: process.env.DB_PASSWORD2,
    database: process.env.DB_NAME2,
});
module.exports = pool;