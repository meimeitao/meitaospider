var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var iconv = require('iconv-lite');
var urls = require('url');

var app = express();
app.set('view engine', 'jade');
app.set('views', __dirname);

app.get('/', function(req, res){
  res.render('index');
});

app.get('/fetch', function(req, res){
  var url = req.query.url
  var parser = '';
  request(
    url,
    function(error, result, body){
      console.log(urls.parse(url).hostname);
      switch(urls.parse(url).hostname){
        case "item.taobao.com":
          parser = './parser/taobao.js';
          body = iconv.decode(body, 'gbk');
          break;
        case "amazon.cn":
          parser = './parser/amazoncn.js';
          break;
        default:
          console.log("parser not found "+url);
          break;
      }
      var $ = cheerio.load(body);

      //TODO
      if(parser != ""){
        var Parser = require(parser);
        var p = new Parser($);
        var j = p.getJSON();

        res.set('Content-Type', 'application/json');
        res.send(j);
      }
    }
  );
});

app.listen(3001, function(){
  console.log('Express is listing 3001');
});
