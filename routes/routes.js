const express = require('express');
const controller = require('../controllers/controller.js');
const app = express.Router();

//-------- Webpages ----------//
app.get('/', controller.getIndex);

module.exports = app;
