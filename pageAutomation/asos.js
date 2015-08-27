var casper = require('casper').create({
  pageSettings: {
    loadImages:  false,
    loadPlugins: false
  },
  timeout: 300000 //MS 5mins
});
var utils = require("utils");
var system = require('system');
var args = casper.cli.args;

var url = args[0];

//casper.on("remote.message", function(message) {
//  this.echo("remote console.log: " + message);
//});
//
//casper.on('page.error', function (msg, trace) {
//    this.echo( 'Error: ' + msg, 'ERROR' );
//});

function parseMoney(amount) {
  return Number(amount.replace(/[^0-9\.]+/g,""));
}

var retData = {};

casper.start(url);

casper.then(function() {
  var properties = [], stocks = [];
  var primitivePriceCurrency = "USD";
  var colorID = "color";
  var colorName = "color";
  var sizeID = "size";
  var sizeName = "size";

  var productInfo = this.evaluate(function() {
    return arrSzeCol_ctl00_ContentMainPage_ctlSeparateProduct;
  });

  var productImages = this.evaluate(function() {
    return arrSepImage_ctl00_ContentMainPage_ctlSeparateProduct;
  });

  var productImagesIndexedByColor = {};
  for (var x in productImages) {
    var tmpImage = productImages[x];
    productImagesIndexedByColor[tmpImage[3]] = tmpImage;
  }

  var color = {}, size = {};
  color['name'] = colorName;
  color['id'] = colorID;
  color['data'] = {};
  size['name'] = sizeName;
  size['id'] = sizeID;
  size['data'] = {};

  for (var x in productInfo) {
    var tmpItem = productInfo[x];
    var tmpImage = productImagesIndexedByColor[tmpItem[2].toLowerCase()];

    var tmpColorObject = {
      desc: tmpItem[2]
      , demo: tmpImage ? tmpImage[0] : ""
      , sample: ""
      , primitive_price: parseMoney(tmpItem[5])
      , primitive_price_currency: primitivePriceCurrency
      , exID: tmpItem[2]
    };

    color["data"][tmpItem[2]] = tmpColorObject;

    var tmpSizeObject = {
      desc: tmpItem[1]
      , demo: ""
      , sample: ""
      , primitive_price: parseMoney(tmpItem[5])
      , primitive_price_currency: primitivePriceCurrency
      , exID: tmpItem[1]
    };

    size["data"][tmpItem[1]] = tmpSizeObject;

    tmpStockObj = {};
    tmpStockObj[colorID] = tmpItem[2];
    tmpStockObj[sizeID] = tmpItem[1];
    tmpStockObj["soldout"] = tmpItem[3] == "True" ? 0 : 1;
    stocks.push(tmpStockObj);
  }

  properties.push(color);
  properties.push(size);

  retData = {
    "properties": properties
    , "stocks": stocks
  };
  
});

casper.run(function() {
  utils.dump(retData);
  setTimeout(function() {
    casper.exit();
  }, 0);
});
