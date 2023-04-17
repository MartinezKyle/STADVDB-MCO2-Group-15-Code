const express = require('express');
const controller = require('../controllers/controller.js');

const app = express();

// for get
app.get('/', controller.getIndex);
app.get('/add-movie', controller.getAdd);
app.get('/edit-movie/:id-:year', controller.getEdit);
app.get('/delete-movie/:id-:year-:name-:rank', controller.postDelete);

// for post
app.post('/add-movie', controller.postAdd);
app.post('/edit-movie', controller.postEdit);

module.exports = app;