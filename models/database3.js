// createConnection - we have to manage from our side we have to do and close the connection
// createPool - we can create a pool of connections
const mysql = require('mysql');
const fs = require('fs');
const { deflateSync } = require('zlib');
require('dotenv').config();
const path = require('path');
var isNode3Online = true;
// connectionLimit how many parallel connections you want
// Create connection to MySQL
const pool = mysql.createConnection ({
    host: process.env.DB_HOST3,
    user: process.env.DB_USER3,
    password: process.env.DB_PASSWORD3,
    database: process.env.DB_NAME3,
});
// 
// pool.connect((err) => {
//     if(err) {
//         isNode3Online = false;
//         throw err;
//     }
//     else {
//         isNode3Online = true;
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