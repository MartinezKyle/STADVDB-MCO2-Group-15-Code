const http = require('http');
const path = require('path');
const express = require('express');
const exphbs = require('express-handlebars');
const mysql = require('mysql');
const routes = require('./routes/routes.js');

const app = express();
const port = 3000; //Port number

app.use(express.static(__dirname + "/public"));

app.engine("hbs", exphbs.engine({extname: 'hbs'})); 
app.set("view engine", "hbs");
app.set("views", "./views");

app.use(`/`, routes);

/* Edit the details for diff connections
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'user',
    password: '1234567890',
  });
  
  connection.connect((error) => {
    if(error){
      console.log('Error connecting to the MySQL Database');
      return;
    }
    console.log('Connection established sucessfully');
  });
  connection.end((error) => {
  });
*/

app.listen(port, () => {
    console.log("Currently listening at Port " + port);
});