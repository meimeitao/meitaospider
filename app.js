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

  var pt = spawn('phantomjs', ['--load-images=false', 'phantompost.js', url, mytrakpaknumber]);

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

  var pt = spawn('phantomjs', ['--load-images=false', 'phantom.js', url]);

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
      //case "www.katespade.com":
      //  parser = './propertyParser/katespade.js';
      //  break;
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
    //case "www.katespade.com":
    //  parser = './pageAutomation/katespade.js';
    //  break;
    default:
      console.log("parser not found "+url);
      res.set('Content-Type', 'application/json');
      res.send('{}');
      break;
  }
  if (!parser) return false;

  var pt = spawn('casperjs', [parser, url, stocks]);

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

//商品属性|属性价格|属性库存|属性样图|属性样本
app.post('/salesProperties', urlencodedParser, function(req, res) {
  var url = req.body.url;
  var parser = "";
  var body = "";

  var hostname = urls.parse(url).hostname;
  var sslTLSV = false;
  switch (hostname) {
    case "www.6pm.com":
    case "www.zappos.com":
      parser = './pageAutomation/6pm.js';
      break;
    case "www.carters.com":
      parser = './pageAutomation/carters.js';
      break;
    case "factory.jcrew.com":
    case "www.jcrew.com":
      parser = './pageAutomation/jcrew.js';
      break;
    case "www.ralphlauren.com":
      parser = './pageAutomation/ralphlauren.js';
      break;
    case "www.victoriassecret.com":
      sslTLSV = true;
      parser = './pageAutomation/victoriassecret.js';
      break;
    case "us.asos.com":
    case "www.asos.com":
      parser = './pageAutomation/asos.js';
      break;
    case "www.stevemadden.com":
      parser = './pageAutomation/stevemadden.js';
      break;
    case "www.gilt.com":
      parser = './pageAutomation/gilt.js';
      break;
    case "www.amazon.com":
    case "www.amazon.co.jp":
      parser = './pageAutomation/amazon.js';
      break;
    case "www.rebeccaminkoff.com":
      parser = './pageAutomation/rebeccaminkoff.js';
      break;
    case "www.topshop.com":
      parser = './pageAutomation/topshop.js';
      break;
    case "shop.nordstrom.com":
      parser = './pageAutomation/nordstrom.js';
      break;
    case "www.dsw.com":
      parser = './pageAutomation/dsw.js';
      break;
    case "www.shoes.com":
      parser = './pageAutomation/shoes.js';
      break;
    case "www.soludos.com":
      parser = './pageAutomation/soludos.js';
      break;
    case "www.neimanmarcus.com":
      parser = './pageAutomation/neimanmarcus.js';
      break;
    case "www.everlane.com":
      parser = './pageAutomation/everlane.js';
      break;
    case "www.b-glowing.com":
      parser = './pageAutomation/bglowing.js';
      break;
    case "www.mytheresa.com":
      parser = './pageAutomation/mytheresa.js';
      break;
    case "www.juicycouture.com":
      parser = './pageAutomation/juicycouture.js';
      break;
    case "www.kipling-usa.com":
      parser = './pageAutomation/kipling-usa.js';
      break;
    case "www.shopbop.com":
    case "cn.shopbop.com":
      parser = './pageAutomation/shopbop.js';
      break;
    case "www.follifollie.us.com":
      parser = './pageAutomation/follifollie.js';
      break;
    case "www.saksfifthavenue.com":
      parser = './pageAutomation/saksfifthavenue.js';
      break;
    case "www.toryburch.com":
      parser = './pageAutomation/toryburch.js';
      break;
    case "www.anntaylor.com":
      parser = './pageAutomation/anntaylor.js';
      break;
    case "otteny.com":
      parser = './pageAutomation/otteny.js';
      break;
    case "needsupply.com":
      parser = './pageAutomation/needsupply.js';
      break;
    case "www.colehaan.com":
      parser = './pageAutomation/colehaan.js';
      break;
    case "bananarepublic.gap.com":
    case "oldnavy.gap.com":
      parser = './pageAutomation/bananarepublic.js';
      break;
    case "www.farfetch.com":
      parser = './pageAutomation/farfetch.js';
      break;
    case "www.revolveclothing.com":
      parser = './pageAutomation/revolveclothing.js';
      break;
    case "www.katespade.com":
      parser = './pageAutomation/katespade.js';
      break;
    case "www.coggles.com":
      parser = './pageAutomation/coggles.js';
      break;
    case "www.giorgioarmanibeauty-usa.com":
      parser = './pageAutomation/giorgioarmanibeauty-usa.js';
      break;
    case "www.yslbeautyus.com":
      parser = './pageAutomation/yslbeautyus.js';
      break;
    case "www.uggaustralia.com":
      parser = './pageAutomation/uggaustralia.js';
      break;
    case "www.bluefly.com":
      parser = './pageAutomation/bluefly.js';
      break;
    case "www.childrensplace.com":
      parser = './pageAutomation/childrensplace.js';
      break;
    case "www.lastcall.com":
      parser = './pageAutomation/lastcall.js';
      break;
    case "www.allsole.com":
      parser = './pageAutomation/allsole.js';
      break;
    case "www.thehut.com":
      parser = './pageAutomation/thehut.js';
      break;
    case "www.c21stores.com":
      parser = './pageAutomation/c21stores.js';
      break;
    case "www.ninewest.com":
      parser = './pageAutomation/ninewest.js';
      break;
    case "www.levi.com":
      parser = './pageAutomation/levi.js';
      break;
    case "www.cambridgesatchel.com":
      parser = './pageAutomation/cambridgesatchel.js';
      break;
    case "www.loft.com":
      parser = './pageAutomation/loft.js';
      break;
    case "store.americanapparel.net":
      parser = './pageAutomation/americanapparel.js';
      break;
    case "www.clarksusa.com":
      parser = './pageAutomation/clarksusa.js';
      break;
    case "www.stuartweitzman.com":
      parser = './pageAutomation/stuartweitzman.js';
      break;
    case "www.backcountry.com":
      parser = './pageAutomation/backcountry.js';
      break;
    case "www.betseyjohnson.com":
      parser = './pageAutomation/betseyjohnson.js';
      break;
    case "en.stylenanda.com":
      parser = './pageAutomation/stylenanda.js';
      break;
    case "www.aeropostale.com":
      parser = './pageAutomation/aeropostale.js';
      break;
    case "www.radley.co.uk":
      parser = './pageAutomation/radley.js';
      break;
    case "www.nordstromrack.com":
      parser = './pageAutomation/nordstromrack.js';
      break;
    // 商品属性capser脚本添加在这里
    //case "www.myhabit.com":
    //  parser = './pageAutomation/myhabit.js';
    //  break;
    default:
      console.log("parser not found "+url);
      res.set('Content-Type', 'application/json');
      res.send('{}');
      break;
  }
  if (!parser) return false;

  var sslProtocol = sslTLSV ? "tlsv1" : "any";

  var pt = spawn('casperjs', ["--ssl-protocol="+sslProtocol, parser, url]);

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

app.get('/mashort', function(req, res) {
  var url = req.query.url;
  var body = '';

  var pt = spawn('phantomjs', ['--load-images=false', 'mashort.js', url]);

  pt.stdout.on('data', function (data) {
    body += data;
  });

  pt.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
  });

  pt.on('close', function(code) {
    var j = {"redirectUrl":body};
    res.set('Content-Type', 'application/json');
    res.send(j);
  });
});

app.get('/crawler', function(req, res) {
  var url = req.query.url;
  var parser = '';
  var body = '';

  var pt = spawn('phantomjs', ['--load-images=false', 'phantom.js', url]);

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

//通用型,基本页面信息抓取
app.post('/basic', urlencodedParser, function(req, res) {
  var url = req.body.url;
  var body = '';
  var parser = './pageAutomation/basic.js';

  var pt = spawn('casperjs', ["--ssl-protocol=any", parser, url]);

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

app.get('/fetch', function(req, res){
  var url = req.query.url;
  var parser = '';
  var body = '';
  var pt = spawn('phantomjs2', ['--load-images=false', 'phantom.js', url]);

  pt.stdout.on('data', function (data) {
    body += data;
  });

  pt.stderr.on('data', function (data) {
    console.log("error:" + data);
  });

  pt.on('close', function (code) {
    var $ = cheerio.load(body, {decodeEntities: false});
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
        parser = './parser/asos.js';
        break;
      case "www.ashford.com":
        parser = './parser/ashford.js';
        break;
      case "www.6pm.com":
        parser = './parser/6pm.js';
        break;
      case "blog.sina.com.cn":
        parser = './parser/sinablog.js';
        break;
      case "mp.weixin.qq.com":
        parser = './parser/weixin.js';
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

app.get('/bc/list', function(req, res){
  var url = req.query.url;
  var parser = req.query.parser;
  var body = '';
  var pt = spawn('phantomjs2', ['--load-images=false', 'phantom.js', url]);

  pt.stdout.on('data', function(data) {
    body += data;
  });

  pt.stderr.on('data', function(data) {
    console.log('stderr: ' + data);
  });

  pt.on('close', function(code) {
    var $ = cheerio.load(body, {decodeEntities: true});
    if (!parser || parser == '') {
      parser = urls.parse(url).hostname;
    }
    var parserFile = './bc/list/' + parser + '.js';
    var Parser = require(parserFile);
    var json = (new Parser($, url)).getJSON();

    res.set('Content-Type', 'application/json');
    res.send(json);
  });
});

app.listen(3001, function(){
  console.log('Express is listing 3001');
});
