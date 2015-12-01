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

casper.waitFor(function check() {
  return this.evaluate(function() {
    return ProductData.Model.StyleModel ? true :false;
  });
});

casper.then(function() {
  var properties = [], oStocks = {}, propertiesAry = [];
  var primitivePriceCurrency = "USD";

  var variants = this.evaluate(function() {
    return ProductData.Model.StyleModel.ChoiceGroups[0];
  });

  var color = {};
  color['name'] = "color";
  color['id'] = "Color";
  color['data'] = {};

  var colors = [];

  for (var i = 0; i < variants.Color.length; i++) {
    var tmpOption = variants.Color[i];

    var tmpDesc = tmpOption.Value;
    var tmpSample = tmpOption.SwatchUrl;
    var tmpDemo = tmpOption.MiniUrl;
    var tmpID = tmpOption.Value;

    var tmpObject = {
      desc: tmpDesc
      , demo: tmpDemo
      , sample: tmpSample
      , primitive_price: 0
      , primitive_price_currency: primitivePriceCurrency
      , exID: tmpID
    };

    color['data'][tmpID] = tmpObject;
    colors.push(tmpID);
  }

  var size = {};
  size['name'] = "size";
  size['id'] = "Size";
  size['data'] = {};

  var sizes = [];

  for (var i = 0; i < variants.Size.length; i++) {
    var tmpOption = variants.Size[i];

    var tmpDesc = tmpOption.Value;
    var tmpSample = "", tmpDemo = "";
    var tmpID = tmpOption.Value;

    var tmpObject = {
      desc: tmpDesc
      , demo: tmpDemo
      , sample: tmpSample
      , primitive_price: 0
      , primitive_price_currency: primitivePriceCurrency
      , exID: tmpID
    };

    size['data'][tmpID] = tmpObject;
    sizes.push(tmpID);
  }

  var width = {};
  width['name'] = "width";
  width['id'] = "Width";
  width['data'] = {};

  var widthes = [];

  for (var i = 0; i < variants.Width.length; i++) {
    var tmpOption = variants.Width[i];

    var tmpDesc = tmpOption.Value;
    var tmpSample = "", tmpDemo = "";
    var tmpID = tmpOption.Value;

    var tmpObject = {
      desc: tmpDesc
      , demo: tmpDemo
      , sample: tmpSample
      , primitive_price: 0
      , primitive_price_currency: primitivePriceCurrency
      , exID: tmpID
    };

    width['data'][tmpID] = tmpObject;
    widthes.push(tmpID);
  }

  if (colors.length > 0) {
    properties.push(color);
    propertiesAry.push(colors);
  }
  if (sizes.length > 0) {
    properties.push(size);
    propertiesAry.push(sizes);
  }
  if (widthes.length > 0) {
    properties.push(width);
    propertiesAry.push(widthes);
  }

  var stockMapping = cartesianProduct(propertiesAry);
  var stocks = [];
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

  var Skus = this.evaluate(function() {
    return ProductData.Model.StyleModel.Skus;
  });

  var indexedSkus = {};
  for (var i = 0; i < Skus.length; i++) {
    var tmpSku = Skus[i];
    var index = tmpSku["Color"];
    if (tmpSku["Size"]) {
      index += "_" + tmpSku["Size"];
    }
    if (tmpSku["Width"]) {
      index += "_" + tmpSku["Width"];
    }

    indexedSkus[index] = tmpSku["IsAvailable"];
  }

  var tmpStock;
  for (var x in stocks) {
    var tmpStock = stocks[x];
    var index = tmpStock["Color"];
    if (tmpStock["Size"]) {
      index += "_" + tmpStock["Size"];
    }
    if (tmpStock["Width"]) {
      index += "_" + tmpStock["Width"];
    }
    if (indexedSkus[index]) {
      tmpStock["soldout"] = 0;
    } else {
      tmpStock["soldout"] = 1;
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
