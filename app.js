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
    hostname = urls.parse(url).hostname;
    console.log(hostname);
    switch(hostname){
      case "item.taobao.com":
        parser = './parser/taobao.js';
        break;
      case "item.jd.com":
        parser = './parser/jd.js';
        break;
      case "www.amazon.cn":
        parser = './parser/amazoncn.js';
        break;
      case "www.amazon.com":
        parser = './parser/amazon.js';
        break;
      case "www.drugstore.com":
        parser = './parser/drugstore.js';
        break;
      case "web1.sasa.com":
        parser = './parser/sasa.js';
        break;
      case "www.lookfantastic.com":
        parser = './parser/lookfantastic.js';
        break;
      case "global.lotte.com":
        parser = './parser/lotte.js';
        break;
      case "www.ebay.com":
        parser = './parser/ebay.js';
        break;
      case "www.suning.com":
      case "product.suning.com":
      case "sale.suning.com":
        parser = './parser/suning.js';
        break;
      case "mall.jumei.com":
        parser = './parser/jumeimall.js';
        break;
      default:
        console.log("parser not found "+url);
        res.set('Content-Type', 'application/json');
        res.send('{}');
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
