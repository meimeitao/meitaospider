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
//  this.echo( 'Error: ' + msg, 'ERROR' );
//});

var retData = {};

casper.start(url);

casper.waitFor(function check() {
  return this.evaluate(function() {
    return twisterController ? true :false;
  });
});

casper.then(function() {
  var properties = [], propertiesMapping = {}, propertiesAry = [];
  var primitivePriceCurrency = "USD";

  var twisterVariationsData = this.evaluate(function() {
    return twisterController.twisterVariationsData;
  });

  var dimensions = twisterVariationsData.twisterJSInitData.dimensionsDisplay;
  var dimensionValuesData = twisterVariationsData.twisterJSInitData.dimensionValuesData;

  for (var i = 0; i < dimensions.length; i++) {
    var dimension = dimensions[i];
    var tmpDimension = {};
    tmpDimension['name'] = dimension;
    tmpDimension['id'] = dimension;
    tmpDimension['data'] = {};
    
    var tmpDimensionVals = dimensionValuesData[i];

    var tmpProperties = [];
    for (var m = 0; m < tmpDimensionVals.length; m++) {
      var tmpDimensionVal = tmpDimensionVals[m];

      var tmpSample = "";
      var tmpDemo = "";
      var swatchEle = this.evaluate(function(tmpDimensionVal) {
        var ele = document.querySelector("img[alt='"+tmpDimensionVal+"']");
        return ele;
      }, tmpDimensionVal);
      if (swatchEle) {
        tmpSample = swatchEle.src;
        tmpDemo = swatchEle.src.replace(/\._(.*)_\./,'.');
      }

      var tmpDimensionObject = {
        desc: tmpDimensionVal
        , demo: tmpDemo
        , sample: tmpSample
        , primitive_price: 0
        , primitive_price_currency: primitivePriceCurrency
        , exID: m
      };

      tmpDimension['data'][m] = tmpDimensionObject;
      tmpProperties.push(m);
      propertiesMapping[m] = dimension;
    }

    propertiesAry.push(tmpProperties);
    properties.push(tmpDimension);
  }

  var stocks = [];
  var stockMapping = cartesianProduct(propertiesAry);
  for (var x in stockMapping) {
    var tmpRow = stockMapping[x];
    var tmpStock = {};
    for (var y in tmpRow) {
      var selectValue = String(tmpRow[y]);
      var selector = properties[y].id;
      tmpStock[selector] = selectValue;
    }
    tmpStock['soldout'] = 1;
    stocks.push(tmpStock);
  }

  var tmpStock, stockValue, mapping = [];
  for (var x in stocks) {
    tmpStock = stocks[x];
    var tmpTarget = [];
    for (var m in tmpStock) {
      if (m == 'soldout') continue;
      tmpTarget.push(tmpStock[m]);
    }
    var tmpTargetStr = tmpTarget.join("_");
    stockValue = this.evaluate(function(stockStr) {
      return twisterController.twisterAvailabilityCache.isDimCombinationAvailable(stockStr);
    }, tmpTargetStr);
    if (stockValue) {
      stocks[x].soldout = 0;
      mapping.push(stocks[x]);
    } else {
      stocks[x].soldout = 1;
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
  this.exit();
});
