// createConnection - we have to manage from our side we have to do and close the connection
// createPool - we can create a pool of connections
const mysql = require('mysql');
const fs = require('fs');
const { deflateSync } = require('zlib');
require('dotenv').config();
const path = require('path');
var isNode1Online = true;
// connectionLimit how many parallel connections you want
// Create connection to MySQL
const pool = mysql.createConnection ({
    host: process.env.DB_HOST1,
    user: process.env.DB_USER1,
    password: process.env.DB_PASSWORD1,
    database: process.env.DB_NAME1,
});
// 
// pool.connect((err) => {
//     if(err) {
//         isNode1Online = false;
//         throw err;
//     }
//     else {
//         isNode1Online = true;
//         console.log("Is Node 1 Online: " + isNode1Online);
//         console.log('MySql Connected');
//     }
// })

// insert here your own server/database
// const pool = mysql.createConnection ({
//     host: process.env.DB_HOST2,
//     user: process.env.DB_USER2,
//     password: process.env.DB_PASSWORD2,
//     database: process.env.DB_NAME2,
// });
// 
// pool.connect((err) => {
//     if(err) {
//         throw err;
//     }
//     console.log('MySql Connected');
// })

// const pool = mysql.createConnection ({
//     host: process.env.DB_HOST3,
//     user: process.env.DB_USER3,
//     password: process.env.DB_PASSWORD3,
//     database: process.env.DB_NAME3,
// });
// 
// pool.connect((err) => {
//     if(err) {
//         throw err;
//     }
//     console.log('MySql Connected');
// })

// this makes pool be accessible to other files
module.exports = pool;