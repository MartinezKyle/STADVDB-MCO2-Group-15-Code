const db1 = require(`./models/database1.js`);
// const db2 = require(`./models/database2.js`);
// const db3 = require(`./models/database2.js`);
var dotenv = require('dotenv').config();
var express = require('express');
const hbs = require(`hbs`);
const routes = require(`./routes/routes.js`);
var app = express();
const bodyparser = require('body-parser');
var paginate = require('handlebars-paginate');

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static(`public`));

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));

app.set(`view engine`, `hbs`);
hbs.registerPartials(__dirname + `/views/partials`);
hbs.registerHelper('paginate', paginate);
hbs.registerHelper('pagination', function(currentPage, totalPage, size, options) {
    var startPage, endPage, context;
    
    if (arguments.length === 3) {
      options = size;
      size = 5;
    }
  
    startPage = currentPage - Math.floor(size / 2);
    endPage = currentPage + Math.floor(size / 2);
  

    if (startPage <= 0) {
      endPage -= (startPage - 1);
      startPage = 1;
    }
  
    if (endPage > totalPage) {
      endPage = totalPage;
      if (endPage - size + 1 > 0) {
        startPage = endPage - size + 1;
      } else {
        startPage = 1;
      }
    }
  
    context = {
      startFromFirstPage: false,
      pages: [],
      endAtLastPage: false,
      lastPage: totalPage
    };
    if (startPage === 1) {
      context.startFromFirstPage = true;
    }
    for (var i = startPage; i <= endPage; i++) {
      context.pages.push({
        page: i,
        isCurrent: i === currentPage,
      });
    }
    if (endPage === totalPage) {
      context.endAtLastPage = true;
    }
    return options.fn(context);
  });

var template = hbs.compile(".pagination pagination-centered");
var html = template({pagination: {
    page: 3,
    pageCount: 10
}});

const port = process.env.PORT || 3000;

app.use(`/`, routes);

app.listen(port, function () {
    console.log(`Server is running at:`);
    console.log(`http://` + "localhost" + `:` + port);
});