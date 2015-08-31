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

function parseMoney(amount) {
  return Number(amount.replace(/[^0-9\.]+/g,""));
}

var properties = [], stocks = [], propertiesAry = [], propertiesMapping = {}, retData = {};

casper.start(url);

casper.then(function() {
  var primitivePriceCurrency = "USD";

  var productDetailsJSON = this.evaluate(function() {
    return JSON.parse(productDetailsJSON);
  });
  
  for (var x in productDetailsJSON) {
    var tmpPropertyJSON = productDetailsJSON[x];
    var tmpProperty = {};

    var tmpName = x.replace("set","");
    var isColor = tmpName == 'color' ? true : false;
    var tmpNameIndex = isColor ? 'colordisplayname' : tmpName;
    tmpProperty['name'] = tmpName;
    tmpProperty['id'] = x;
    tmpProperty['data'] = {};
    
    var tmpProperties = [];
    for (var m in tmpPropertyJSON) {
      var tmpSet = tmpPropertyJSON[m];
      var tmpPropertyIndex = tmpSet[tmpName];

      var tmpSample = "";
      var tmpDemo = "";
      var properEleImg = this.evaluate(function(pID) {
        return document.querySelector("#"+pID+" img");
      }, tmpPropertyIndex);
      if (properEleImg) {
        tmpDemo = properEleImg.dataset.imgurl;
        tmpSample = properEleImg.src;
      }

      var properPrice = String(0);
      if (isColor) {
        properPrice = this.evaluate(function(pID) {
          return document.querySelector("[data-color='"+pID+"']").parentNode.previousElementSibling.innerText.trim();
        }, tmpPropertyIndex);
      }

      var tmpDimensionObject = {
        desc: tmpSet[tmpNameIndex]
        , demo: tmpDemo
        , sample: tmpSample
        , primitive_price: parseMoney(properPrice)
        , primitive_price_currency: primitivePriceCurrency
        , exID: tmpPropertyIndex
      };

      tmpProperty['data'][tmpPropertyIndex] = tmpDimensionObject;
      tmpProperties.push(tmpPropertyIndex);
      propertiesMapping[tmpPropertyIndex] = x;
    }

    propertiesAry.push(tmpProperties);
    properties.push(tmpProperty);
  }

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

  var tmpStock, stockValue, tmpTarget, mapping = [];
  for (var x in stocks) {
    tmpStock = stocks[x];
    for (var m in tmpStock) {
      if (m == 'soldout') continue;
      tmpTarget = tmpStock[m];
      this.evaluate(function setProperties(id, value) {
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent('click', true, false);
        var ele;
        if (id == 'colorset') {
          ele = document.querySelector(".color-box[data-color='"+value+"']");
        } else if (id == "sizeset") {
          ele = document.querySelector(".size-box[data-size='"+value+"']");
        }
        ele.dispatchEvent(evt);
      }, m, tmpTarget);
    }
    stockValue = this.evaluate(function getStockStatus() {
      while (true) {
        var stockValue = document.querySelector(".add-item").text;
        if (stockValue) return stockValue;
      }
    });
    if (stockValue.toLowerCase() == 'out of stock') {
      stocks[x].soldout = 1;
      mapping.push(stocks[x]);
    } else {
      stocks[x].soldout = 0;
      mapping.push(stocks[x]);
    }
  }

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
