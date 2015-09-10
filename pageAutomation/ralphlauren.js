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

  var itemMap = this.evaluate(function() {
    return itemMap;
  });

  var orderedImageMap = this.evaluate(function() {
    return orderedImageMap_0;
  });

  var imageMap = {};
  for (var x in orderedImageMap) {
    imageMap[orderedImageMap[x]['cId']] = orderedImageMap[x];
  }

  var color = {}, size = {};
  color['name'] = colorName;
  color['id'] = colorID;
  color['data'] = {};
  size['name'] = sizeName;
  size['id'] = sizeID;
  size['data'] = {};

  for (var x in itemMap) {
    var tmpItem = itemMap[x];
    var tmpImage = imageMap[tmpItem["cId"]];

    var tmpColorObject = {
      desc: tmpItem["cDesc"]
      , demo: tmpImage ? tmpImage["v400"] : ""
      , sample: tmpImage ? tmpImage["swatch"] : ""
      , primitive_price: parseMoney(tmpItem["price"])
      , primitive_price_currency: primitivePriceCurrency
      , exID: tmpItem["cId"]
    };

    color["data"][tmpItem["cId"]] = tmpColorObject;

    var tmpSizeObject = {
      desc: tmpItem["sDesc"]
      , demo: ""
      , sample: ""
      , primitive_price: 0
      , primitive_price_currency: primitivePriceCurrency
      , exID: tmpItem["sId"]
    };

    size["data"][tmpItem["sId"]] = tmpSizeObject;
    
    tmpStockObj = {};
    tmpStockObj[colorID] = tmpItem["cId"];
    tmpStockObj[sizeID] = tmpItem["sId"];
    tmpStockObj["soldout"] = tmpItem["quantityOnHand"] > 0 ? 0 : 1;
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
  this.exit();
});
