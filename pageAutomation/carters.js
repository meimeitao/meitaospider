var casper = require('casper').create({});
var utils = require("utils");
var system = require('system');
var args = casper.cli.args;
var cartesianProduct = require('cartesian-product');

var url = args[0];

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

var properties = [], stocks = [], propertiesAry = [], propertiesMapping = {}, retData = {};

casper.start(url);

casper.then(function() {
  var primitivePriceCurrency = "USD";

  var retProperties = this.evaluate(function() {
    var properties = [], propertiesAry = [], primitivePriceCurrency = "USD", currentStockUrls = [];
    var attrs = document.querySelectorAll(".attribute");
    Array.prototype.map.call(attrs, function(attr) {
      var tmpAttr = attr;
      var tmpProperty = {};

      var tmpSwatchAnchors = tmpAttr.querySelectorAll(".swatchanchor");
      var tmpLabel = tmpAttr.querySelector(".label").innerText;
      var tmpSwatches = tmpAttr.querySelector(".swatches").className.split(" ")[1];

      tmpProperty['name'] = tmpLabel;
      tmpProperty['id'] = tmpSwatches;
      tmpProperty['data'] = {};

      var tmpProperties = [];

      Array.prototype.map.call(tmpSwatchAnchors, function(tmpSwatchAnchor) {
        var tmpLgimg = tmpSwatchAnchor.dataset.lgimg, demo = "";
        if (tmpLgimg) {
          console.log(tmpLgimg);
          try {
            var tmpLgimgJson = JSON.parse(tmpLgimg);
            demo = tmpLgimgJson["url"];
          } catch(e) {
            demo = tmpLgimg.match(/"url":"(.*)",/)[1];
          }
        }

        var tmpBg = tmpSwatchAnchor.style.backgroundImage, sample = "";
        if (tmpBg) {
          sample = tmpBg.match(/url\((.*)\)/)[1];
        }

        var tmpDesc = tmpSwatchAnchor.title;
        
        var tmpDimensionObject = {
          desc: tmpDesc
          , demo: demo
          , sample: sample
          , primitive_price: 0
          , primitive_price_currency: primitivePriceCurrency
          , exID: tmpDesc
        };

        tmpProperty['data'][tmpDesc] = tmpDimensionObject;
        tmpProperties.push(tmpDesc);
        if (tmpSwatchAnchor.href) {
          currentStockUrls.push(tmpSwatchAnchor.href);
        }
      });

      propertiesAry.push(tmpProperties);
      properties.push(tmpProperty);
    });

    return {
      propertiesAry: propertiesAry
      , properties: properties
      , currentStockUrls: currentStockUrls
    }
  });

  properties = retProperties["properties"];
  propertiesAry = retProperties["propertiesAry"];

  var stocks = [];
  var stockMapping = cartesianProduct(propertiesAry);
  for (var x in stockMapping) {
    var tmpRow = stockMapping[x];
    var tmpStock = {};
    for (var y in tmpRow) {
      var selectValue = tmpRow[y];
      var selector = properties[y].id;
      tmpStock[selector] = selectValue;
    }
    tmpStock['soldout'] = 1;
    stocks.push(tmpStock);
  }

  var currentStockUrls = retProperties["currentStockUrls"];

  var uri = parseUrl(currentStockUrls[0]);
  var searchTemplate = serialize(uri.search);

  var stockUrls = [];

  for (var x in stocks) {
    tmpStock = stocks[x];
    for (var m in tmpStock) {
      if (m == 'soldout') continue;
      tmpTarget = tmpStock[m];
      searchTemplate = setTemplateAttribute(searchTemplate,m,tmpTarget);
    }
    var tmpSearch = "?" + joinSearchTemplate(searchTemplate)
    uri.search = tmpSearch;
  
    stocks[x]['href'] = uri.href;
    
    stockUrls.push(uri.href);
  }

  var i = 0;
  this.start().each(stockUrls, function(self, link) {
    self.thenOpen(link, function() {
      ++i;
      var notAvailable = this.evaluate(function() {
        return document.querySelector(".not-available-msg");
      });
      var isSoldout = notAvailable ? 1 : 0;
      stocks = stockSoldout(stocks, link, isSoldout);
    });
  });

  retData = {
    "properties": properties
    , "stocks": stocks
  };

});

casper.run(function() {
  utils.dump(retData);
  this.exit();
});
