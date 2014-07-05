var express = require('express');
var request = require('request');
var cheerio = require('cheerio');

var app = express();
app.set('view engine', 'jade');
app.set('views', __dirname);

app.get('/', function(req, res){
  res.render('index');
});

app.get('/fetch', function(req, res){
  request(
    req.query.url,
    function(error, result, body){
      var $ = cheerio.load(body);

      //TODO
      var Parser = require('./parser/amazoncn.js');
      var p = new Parser($);
      var j = p.getJSON();

      res.set('Content-Type', 'application/json');
      res.send(j);
    }
  );
});

app.listen(3001, function(){
  console.log('Express is listing 3001');
});
