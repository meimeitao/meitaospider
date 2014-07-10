var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var urls = require('url');
var spawn = require('child_process').spawn

var app = express();
app.set('view engine', 'jade');
app.set('views', __dirname);

app.get('/', function(req, res){
  res.render('index');
});

app.get('/fetch', function(req, res){
  var url = req.query.url
  var parser = '';
  var body = '';
  pt = spawn('phantomjs', ['--load-images=false', 'phantom.js', url]);

  pt.stdout.on('data', function (data) {
    body += data;
  });

  pt.stderr.on('data', function (data) {
    console.log("error:" + data);
  });

  pt.on('close', function (code) {
    //console.log(body);
    var $ = cheerio.load(body);
    parser = '';
    switch(urls.parse(url).hostname){
      case "item.taobao.com":
        parser = './parser/taobao.js';
        break;
      case "item.jd.com":
        parser = './parser/jd.js';
        break;
      case "amazon.cn":
        parser = './parser/amazoncn.js';
        break;
      default:
        console.log("parser not found "+url);
        break;
    }
    if(parser != ""){
      var Parser = require(parser);
      var p = new Parser($);
      var j = p.getJSON();

      res.set('Content-Type', 'application/json');
      res.send(j);
    }
  });

});

app.listen(3001, function(){
  console.log('Express is listing 3001');
});
