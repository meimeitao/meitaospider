var casper = require('casper').create({});
var utils = require("utils");
var system = require('system');
var args = casper.cli.args;

//var url = args[0];
//var stockMapping = JSON.parse(args[1]);

var url = "https://www.katespade.com/flirty-back-mini-dress/NJMU5252,en_US,pd.html";
var stockMapping = JSON.parse('[{"SIZE:":"00","COLOR:":"001","soldout":1},{"SIZE:":"00","COLOR:":"627","soldout":1},{"SIZE:":"00","COLOR:":"937","soldout":1},{"SIZE:":"0","COLOR:":"001","soldout":1},{"SIZE:":"0","COLOR:":"627","soldout":1},{"SIZE:":"0","COLOR:":"937","soldout":1},{"SIZE:":"2","COLOR:":"001","soldout":1},{"SIZE:":"2","COLOR:":"627","soldout":1},{"SIZE:":"2","COLOR:":"937","soldout":1},{"SIZE:":"4","COLOR:":"001","soldout":1},{"SIZE:":"4","COLOR:":"627","soldout":1},{"SIZE:":"4","COLOR:":"937","soldout":1},{"SIZE:":"6","COLOR:":"001","soldout":1},{"SIZE:":"6","COLOR:":"627","soldout":1},{"SIZE:":"6","COLOR:":"937","soldout":1},{"SIZE:":"8","COLOR:":"001","soldout":1},{"SIZE:":"8","COLOR:":"627","soldout":1},{"SIZE:":"8","COLOR:":"937","soldout":1},{"SIZE:":"10","COLOR:":"001","soldout":1},{"SIZE:":"10","COLOR:":"627","soldout":1},{"SIZE:":"10","COLOR:":"937","soldout":1},{"SIZE:":"12","COLOR:":"001","soldout":1},{"SIZE:":"12","COLOR:":"627","soldout":1},{"SIZE:":"12","COLOR:":"937","soldout":1},{"SIZE:":"14","COLOR:":"001","soldout":1},{"SIZE:":"14","COLOR:":"627","soldout":1},{"SIZE:":"14","COLOR:":"937","soldout":1},{"SIZE:":"16","COLOR:":"001","soldout":1},{"SIZE:":"16","COLOR:":"627","soldout":1},{"SIZE:":"16","COLOR:":"937","soldout":1}]');

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
    if (x.indexOf(index.split(":")[0].toLowerCase()) > -1) {
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

var searchTemplate, uri, stockUrls = [];
casper.start(url);
casper.then(function() {
  var tmpUrl = this.evaluate(function() {
    var ele = document.querySelector(".swatchanchor");
    return ele.href;
  });

  utils.dump(tmpUrl);
  var templateUrl = this.thenOpen(tmpUrl, function() {
    return this.evaluate(function() {
      var ele = document.querySelector(".swatchanchor");
      return ele.href;
    });
  });
  
  utils.dump(templateUrl);
  uri = parseUrl(templateUrl);
  searchTemplate = serialize(uri.search);

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
  utils.dump(stockUrls);
});

var i = 0;
casper.then(function() {
  utils.dump("each link start...");
  this.each(stockUrls, function(self, link) {
    utils.dump(link);
    self.thenOpen(link, function() {
      this.capture('../runtime/screenshot_'+ i +'.png');
      ++i;
      var notAvailable = this.evaluate(function() {
        return document.querySelector(".not-available-msg");
      });
      var isSoldout = notAvailable ? 1 : 0;
      stockMapping = stockSoldout(stockMapping, link, isSoldout);
    });
  });
});

casper.run(function() {
  utils.dump(stockMapping);
  this.exit();
});
