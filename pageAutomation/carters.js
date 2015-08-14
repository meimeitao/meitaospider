var casper = require('casper').create({});
var utils = require("utils");
var system = require('system');
var args = casper.cli.args;

var url = args[0];
var stockMapping = JSON.parse(args[1]);

//var url = "http://www.carters.com/carters-baby-baby-boy-accessories-shoes-and-slippers/V_CWS14-202G.html?dwvar_V__CWS14-202G_size=3&dwvar_V__CWS14-202G_color=Color#navID=header&start=27&cgid=carters-baby-baby-boy-accessories-shoes-and-slippers"
//var stockMapping = JSON.parse('[{"size":"3.5","color":"Color","soldout":1},{"size":"4","color":"Color","soldout":1},{"size":"4.5","color":"Color","soldout":1},{"size":"5","color":"Color","soldout":1},{"size":"3","color":"Color","soldout":1}]');

//casper.on("remote.message", function(message) {
//  this.echo("remote console.log: " + message);
//});
//
//casper.on('page.error', function (msg, trace) {
//    this.echo( 'Error: ' + msg, 'ERROR' );
//});

function parseUrl(origin_url) {
  var uri = document.createElement('a');
  uri.href = origin_url;
  return uri;
}

function serialize(str) {
  var search = str.substring(1);
  var searchTemplate = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}')
  return searchTemplate;
}

function setTemplateAttribute(template,index,value) {
  for (var x in template) {
    if (x.indexOf(index) > -1) {
      template[x] = value;
    }
  }
  return template;
}

function joinSearchTemplate(template) {
  var str;
  for (var x in template) {
    if (str) {
      str = str + "&" + x + "=" + template[x];
    } else {
      str = x + "=" + template[x];
    }
  }
  return str;
}

function stockSoldout(stocks, url, isSoldout) {
  for (var x in stocks) {
    stock = stocks[x];
    for (var m in stock) {
      if (m == 'href') {
        if (stock[m] == url) {
          stocks[x]['soldout'] = isSoldout;
          delete(stocks[x][m]);
        }
      }
    }
  }
  return stocks;
}

uri = parseUrl(url);
var searchTemplate = serialize(uri.search);

var stockUrls = [];

for (var x in stockMapping) {
  tmpStock = stockMapping[x];
  for (var m in tmpStock) {
    if (m == 'soldout') continue;
    tmpTarget = tmpStock[m];
    searchTemplate = setTemplateAttribute(searchTemplate,m,tmpTarget);
  }
  var tmpSearch = "?" + joinSearchTemplate(searchTemplate)
  uri.search = tmpSearch;

  stockMapping[x]['href'] = uri.href;
  
  stockUrls.push(uri.href);
}

var i = 0;
casper.start().each(stockUrls, function(self, link) {
  self.thenOpen(link, function() {
    this.capture('../runtime/screenshot_'+ i +'.png');
    ++i;
    var notAvailable = this.evaluate(function() {
      return document.querySelector(".not-available-msg");
    });
    //var notAvailable = document.querySelector(".not-available-msg");
    var isSoldout = notAvailable ? 1 : 0;
    stockMapping = stockSoldout(stockMapping, link, isSoldout);
  });
});

casper.run(function() {
  utils.dump(stockMapping);
  this.exit();
});
