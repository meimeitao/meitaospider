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
var cartesianProduct = require('cartesian-product');

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
  var properties = [], oStocks = {}, propertiesAry = [];
  var primitivePriceCurrency = "USD";
  var colorID = "color";
  var colorName = "color";
  var sizeID = "size";
  var sizeName = "size";
  var choiceName = "choice";
  var choiceID = "choice";

  var itemMap = this.evaluate(function() {
    return nord.config.settings.product.skus;
  });

  var galleryUrl = this.evaluate(function() {
    return nord.config.settings.urls.gallery;
  });

  var color = {}, size = {}, choice = {};
  color['name'] = colorName;
  color['id'] = colorID;
  color['data'] = {};
  size['name'] = sizeName;
  size['id'] = sizeID;
  size['data'] = {};
  choice['name'] = choiceName;
  choice['id'] = choiceID;
  choice['data'] = {};

  var choices = [];
  var colores = [];
  var sizes = [];
  for(var i = 0; i < itemMap.length; i++) {
    var tmpItem = itemMap[i];

    //版型START
    if (!choice["data"][tmpItem["choiceGroup"]]) {
      var tmpChoiceGroup = {
        desc: tmpItem['choiceGroup']
        , demo: ""
        , sample: ""
        , primitive_price: parseMoney(tmpItem["originalPrice"])
        , primitive_price_currency: primitivePriceCurrency
        , exID: tmpItem['choiceGroup']
      };

      choice["data"][tmpItem["choiceGroup"]] = tmpChoiceGroup;
      choices.push(tmpItem["choiceGroup"]);
    }

    //COLOR START
    if (!color["data"][tmpItem["colorId"]]) {
      var tmpDemo = this.evaluate(function(colorID) {
        var colorSwatchEle = document.querySelector("#color-"+colorID);
        return colorSwatchEle ? colorSwatchEle.dataset.imgFilename : "";
      }, tmpItem["colorId"]);

      var tmpColorObject = {
        desc: tmpItem["color"]
        , demo: galleryUrl + tmpDemo
        , sample: galleryUrl + tmpItem["swatchImageUrl"]
        , primitive_price: 0
        , primitive_price_currency: primitivePriceCurrency
        , exID: tmpItem["colorId"]
      };

      color["data"][tmpItem["colorId"]] = tmpColorObject;
      colores.push(tmpItem["colorId"]);
    }

    //SIZE START
    if (!size["data"][tmpItem["size"]]) {
      var tmpSizeObject = {
        desc: tmpItem["size"]
        , demo: ""
        , sample: ""
        , primitive_price: 0
        , primitive_price_currency: primitivePriceCurrency
        , exID: tmpItem["size"]
      };

      size["data"][tmpItem["size"]] = tmpSizeObject;
      sizes.push(tmpItem["size"]);
    }

    var stockKeyArray = [];
    stockKeyArray.push(tmpItem["choiceGroup"]);
    stockKeyArray.push(tmpItem["colorId"]);
    stockKeyArray.push(tmpItem["size"]);
    var stockKey = stockKeyArray.join("_");
    oStocks[stockKey] = 1;
  }

  propertiesAry.push(choices);
  propertiesAry.push(colores);
  propertiesAry.push(sizes);

  properties.push(choice);
  properties.push(color);
  properties.push(size);

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

  var tmpStock, stockValue;
  for (var x in stocks) {
    tmpStock = stocks[x];
    var tmpTarget = [];
    for (var m in tmpStock) {
      if (m == 'soldout') continue;
      tmpTarget.push(tmpStock[m]);
    }
    var tmpTargetStr = tmpTarget.join("_");
    stockValue = oStocks[tmpTargetStr] ? false : true;
    if (stockValue) {
      stocks[x].soldout = 1;
    } else {
      stocks[x].soldout = 0;
    }
  }

  retData = {
    "properties": properties
    , "stocks": stocks
  };
  
});

casper.run(function() {
  utils.dump(retData);
  this.exit();
});
