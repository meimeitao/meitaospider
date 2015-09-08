var casper = require('casper').create({
  pageSettings: {
    loadImages:  false,
    loadPlugins: false,
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

casper.start(url);

casper.then(function() {
  var properties = [], propertiesMapping = {}, propertiesAry = [];
  var primitivePriceCurrency = "USD";

  var attributes = this.evaluate(function() {
    return spConfig.config.attributes;
  });

  for (var x in attributes) {
    var attribute = attributes[x];

    var tmpDimension = {};
    tmpDimension['name'] = attribute.label;
    tmpDimension['id'] = attribute.id;
    tmpDimension['data'] = {};

    var tmpOptions = attribute.options;
    var tmpProperties = [];
    for (var i = 0; i < tmpOptions.length; i++) {
      var tmpOption = tmpOptions[i];

      var tmpDemo = "";
      if (attribute.code == 'color') {
        tmpDemo = this.evaluate(function(title) {
          var swatchImgEle = document.querySelector(".swatch-option[title='"+title+"']");
          return swatchImgEle ? swatchImgEle.dataset.toggleImage : "";
        }, tmpOption.label);
      }

      var tmpDimensionObject = {
        desc: tmpOption.label.trim()
        , demo: tmpDemo
        , sample: tmpOption.swatch.img ? tmpOption.swatch.img : ""
        , primitive_price: tmpOption.price
        , primitive_price_currency: primitivePriceCurrency
        , exID: tmpOption.id
      };

      tmpDimension['data'][tmpOption.id] = tmpDimensionObject;
      tmpProperties.push(tmpOption.id);
      propertiesMapping[tmpOption.id] = attribute.id;
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

  var tmpStock, stockValue, tmpTarget;
  for (var x in stocks) {
    tmpStock = stocks[x];
    var propertyCount = 0;
    for (var m in tmpStock) {
      if (m == 'soldout') continue;
      ++propertyCount;
      tmpTarget = tmpStock[m];
      this.evaluate(function setProperties(id, value) {
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent('click', true, false);
        var ele = document.querySelector("#swatch_container_"+id+" span.swatch-option[id=swatch"+value+"]");
        if (ele) {
          ele.dispatchEvent(evt);
        }
      }, m, tmpTarget);
    }
    //this.capture('runtime/screenshot_'+x+'.png');
    stockValue = this.evaluate(function getStockStatus() {
      return document.querySelectorAll(".selected").length;
    });
    if (stockValue == propertyCount) {
      stocks[x].soldout = 0;
    } else {
      stocks[x].soldout = 1;
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
