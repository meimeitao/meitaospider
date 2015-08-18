var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var urls = require('url');
var spawn = require('child_process').spawn
var log4js = require('log4js');

log4js.configure({
  appenders: [
    { type: 'console' },
    {
      type: 'file',
      filename: 'logs/access.log',
      maxLogSize: 1024,
      backups:3,
      category: 'normal'
    }
  ],
  replaceConsole: true
});
var logger = log4js.getLogger('normal');
logger.setLevel('INFO');

var app = express();
app.set('view engine', 'jade');
app.set('views', __dirname);

app.use(log4js.connectLogger(logger, {level:log4js.levels.INFO}));
app.use(app.router);

//TODO
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: true });
app.use(jsonParser);
app.use(urlencodedParser);

app.get('/', function(req, res){
  res.render('index');
});

app.get('/post', function(req, res){
  var url = req.query.url;
  var mytrakpaknumber = req.query.mytrakpaknumber;
  var parser = '';
  var body = '';

  pt = spawn('phantomjs', ['--load-images=false', 'phantompost.js', url, mytrakpaknumber]);

  pt.stdout.on('data', function (data) {
    body += data
  });

  pt.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
  });

  pt.on('close', function (code) {
    var $ = cheerio.load(body);
    var Parser = require("./parser/trackmytrakpak.js");
    var p = new Parser($);
    try {
      var j = p.getJSON();
    } catch (e) {
      console.log(e.message);
      var j = {'status':'001','msg':e.message};
    }

    res.set('Content-Type', 'application/json');
    res.send(j);
  });

});

app.get('/salesPropertiesCrawler', function(req, res){
  var url = req.query.url;
  var parser = '';
  var body = '';

  pt = spawn('phantomjs', ['--load-images=false', 'phantom.js', url]);

  pt.stdout.on('data', function (data) {
    body += data;
  });

  pt.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
  });

  pt.on('close', function (code) {
    var $ = cheerio.load(body);
    var hostname = urls.parse(url).hostname;
    switch(hostname) {
      case "www.6pm.com":
        parser = './propertyParser/6pm.js';
        break;
      case "www.carters.com":
        parser = './propertyParser/carters.js';
        break;
      case "www.ralphlauren.com":
        parser = './propertyParser/ralphlauren.js';
        break;
      case "factory.jcrew.com":
        parser = './propertyParser/jcrew.js';
        break;
      case "www.rebeccaminkoff.com":
        parser = './propertyParser/rebeccaminkoff.js';
        break;
      case "us.asos.com":
        parser = './propertyParser/asos.js';
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

app.post('/salesPropertiesStocks', urlencodedParser, function(req, res) {
  var url = req.body.url;
  var stocks = req.body.stocks;
  var parser = "";
  var body = "";

  var hostname = urls.parse(url).hostname;
  switch (hostname) {
    case "www.6pm.com":
      parser = './pageAutomation/6pm.js';
      break;
    case "www.carters.com":
      parser = './pageAutomation/carters.js';
      break;
    case "www.ralphlauren.com":
      parser = './pageAutomation/ralphlauren.js';
      break;
    case "factory.jcrew.com":
      parser = './pageAutomation/jcrew.js';
      break;
    case "www.rebeccaminkoff.com":
      parser = './pageAutomation/rebeccaminkoff.js';
      break;
    case "us.asos.com":
      parser = './pageAutomation/asos.js';
      break;
    default:
      console.log("parser not found "+url);
      res.set('Content-Type', 'application/json');
      res.send('{}');
      break;
  }
  if (!parser) return false;

  pt = spawn('casperjs', [parser, url, stocks]);

  pt.stdout.on('data', function (data) {
    body += data;
  });

  pt.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
  });

  pt.on('close', function (code) {
    res.set('Content-Type', 'application/json');
    res.send(body);
  });
});

app.get('/crawler', function(req, res) {
  var url = req.query.url;
  var parser = '';
  var body = '';

  pt = spawn('phantomjs', ['--load-images=false', 'phantom.js', url]);

  pt.stdout.on('data', function (data) {
    body += data
  });

  pt.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
  });

  pt.on('close', function(code) {
    var $ = cheerio.load(body);
    hostname = urls.parse(url).hostname;
    if (hostname.indexOf("mashort.cn") > -1) {
      parser = './parser/mashort.js';
    } else if (hostname.indexOf("baron.laiwang.com") > -1) {
      parser = './parser/laiwang.js';
    } else {
      switch(hostname) {
        case "tb.cn":
        case "item.taobao.com":
          parser = './parser/taobao.js';
          break;
        case "h5.m.taobao.com":
          parser = './parser/h5mtaobao.js';
          break;
        case "detail.m.tmall.com":
          parser = './parser/mtmall.js';
          break;
        case "detail.tmall.com":
          parser = './parser/tmall.js';
          break;
        case "www.amazon.cn":
          parser = './parser/amazoncn.js';
          break;
        case "www.suning.com":
        case "product.suning.com":
        case "sale.suning.com":
          parser = './parser/suning.js';
          break;
        case "chaoshi.detail.tmall.com":
          parser = './parser/tmallchaoshi.js';
          break;
        case "detail.tmall.hk":
          parser = './parser/tmallhk.js';
          break;
        case "item.m.jd.com":
          parser = './parser/mjd.js';
          break;
        case "item.jd.com":
          parser = './parser/jd.js';
          break;
        default:
          console.log("parser not found "+url);
          res.set('Content-Type', 'application/json');
          res.send('{}');
          break;
      }
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
    var $ = cheerio.load(body);
    parser = '';
    hostname = urls.parse(url).hostname;
    switch(hostname){
      case "item.taobao.com":
        parser = './parser/taobao.js';
        break;
      case "detail.tmall.com":
        parser = './parser/tmall.js';
        break;
      case "detail.tmall.hk":
        parser = './parser/tmallhk.js';
        break;
      case "chaoshi.detail.tmall.com":
        parser = './parser/tmallchaoshi.js';
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
      case "www.mankind.co.uk":
        parser = './parser/mankind.js';
        break;
      case "www.hqhair.com":
        parser = './parser/hqhair.js';
        break;
      case "www.gilt.com":
        parser = './parser/gilt.js';
        break;
      case "www.thehut.com":
        parser = './parser/thehut.js';
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
      case "www.mybag.com":
        parser = './parser/mybag.js';
        break;
      case "www.allsole.com":
        parser = './parser/allsole.js';
        break;
      case "www.coggles.com":
        parser = './parser/coggles.js';
        break;
      case "www.beautyexpert.com":
        parser = './parser/beautyexpert.js';
        break;
      case "www.carters.com":
        parser = './parser/carters.js';
        break;
      case "us.asos.com":
        parse = './parser/asos.js';
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
