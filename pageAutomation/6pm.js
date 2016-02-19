var casper = require('casper').create({
  pageSettings: {
    loadImages:  false,
    loadPlugins: false
  },
  timeout: 300000 //MS 5mins
});
var utils = require("utils");
var system = require('system');
var cartesianProduct = require('cartesian-product');

var args = casper.cli.args;

var url = args[0];

//casper.on("remote.message", function(message) {
//  this.echo("remote console.log: " + message);
//});

//casper.on('page.error', function (msg, trace) {
//    this.echo( 'Error: ' + msg, 'ERROR' );
//});
var retData = {};

casper.start(url);

casper.then(function() {
  var properties = [], stocks = [], propertiesAry = [], propertiesMapping = {};
  var primitivePriceCurrency = "USD";

  var colorNames = this.evaluate(function() {
    return colorNames;
  });

  var pImgs = this.evaluate(function() {
    return pImgs;
  });

  var styleIds = this.evaluate(function() {
    return styleIds;
  });

  var colorPrices = this.evaluate(function() {
    return colorPrices;
  });

  var propertyColor = {};
  propertyColor['name'] = "color";
  propertyColor['id'] = "color";
  propertyColor['data'] = {};
  var colorProperties = [];
  for (var x in colorNames) {
    var tmpColorName = colorNames[x];
    var tmpStyleId = styleIds[x];
    var tmpDemo = pImgs[tmpStyleId]['MULTIVIEW']['p'];
    var tmpSample = pImgs[tmpStyleId]['MULTIVIEW']['p'].replace("p-MULTIVIEW", "8-SWATCH");
    var tmpColorObject = {
      desc: tmpColorName
      , demo: tmpDemo
      , sample: tmpSample
      , primitive_price: colorPrices[x]['nowInt']
      , primitive_price_currency: primitivePriceCurrency
      , exID: x
    }
    colorProperties.push(x);
    propertyColor['data'][x] = tmpColorObject;
    propertiesMapping[x] = 'color';
  }

  propertiesAry.push(colorProperties);
  properties.push(propertyColor);

  var dimensions = this.evaluate(function() {
    return dimensions;
  });

  var dimToUnitToValJSON = this.evaluate(function() {
    return dimToUnitToValJSON;
  });

  var dimensionIdToNameJson = this.evaluate(function() {
    return dimensionIdToNameJson;
  });

  var valueIdToNameJSON = this.evaluate(function() {
    return valueIdToNameJSON;
  });

  for (var x in dimensions) {
    var tmpDimension = dimensions[x];
    var tmpProperty = {};

    var tmpDimensionVals = [];
    for (var m in dimToUnitToValJSON[tmpDimension]) {
      tmpDimensionVals = dimToUnitToValJSON[tmpDimension][m];
    }
    var tmpDimensionName = dimensionIdToNameJson[tmpDimension];
    tmpProperty['name'] = tmpDimensionName;
    tmpProperty['id'] = tmpDimension;
    tmpProperty['data'] = {};

    var tmpProperties = [];
    for (var n in tmpDimensionVals) {
      var tmpDimensionVal = tmpDimensionVals[n];
      var tmpDimensionObject = {
        desc: valueIdToNameJSON[tmpDimensionVal]["value"]
        , demo: ""
        , sample: ""
        , primitive_price: 0
        , primitive_price_currency: primitivePriceCurrency
        , exID: tmpDimensionVal
      };

      tmpProperty['data'][tmpDimensionVal] = tmpDimensionObject;
      tmpProperties.push(tmpDimensionVal);
      propertiesMapping[tmpDimensionVal] = tmpDimension;
    }

    propertiesAry.push(tmpProperties);
    properties.push(tmpProperty);
  }

  var stockJSON = this.evaluate(function() {
    return stockJSON;
  });

  var flatStockJSON = {};
  for (var x in stockJSON) {
    var tmpStockJSON = stockJSON[x];
    var tmpIndex = [];
    for (var m in tmpStockJSON) {
      if (m == 'id' || m == 'onHand' || m == 'isAvailable' || m == 'isPartial') continue;
      tmpIndex.push(m);
      tmpIndex.push(tmpStockJSON[m]);
    }
    var tmpIndexStr = tmpIndex.join("_");
    flatStockJSON[tmpIndexStr] = tmpStockJSON["onHand"] > 0 ? 0 : 1;
  }

  var stockCartesianPrd = cartesianProduct(propertiesAry);

  for (var x in stockCartesianPrd) {
    var tmpRow = stockCartesianPrd[x];
    var tmpStock = {};
    var soldoutFlag = 1;
    var tmpIndex = [];
    for (var y in tmpRow) {
      var selectValue = tmpRow[y];
      var selector = propertiesMapping[selectValue];
      tmpStock[selector] = String(selectValue);
      tmpIndex.push(selector);
      tmpIndex.push(selectValue);
    }
    var tmpIndexStr = tmpIndex.join("_");
    tmpStock['soldout'] = flatStockJSON[tmpIndexStr] == 0 ? 0 : 1;
    stocks.push(tmpStock);
  }

  retData = {
    "properties": properties
    , "stocks": stocks
  };
});

casper.run(function() {
  utils.dump(retData);
  casper.exit();
});
