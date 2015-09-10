var casper = require('casper').create({
  pageSettings: {
    loadImages:  false
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

var retData = {};

casper.start(url);

casper.then(function() {
  var retProperties = this.evaluate(function() {
    function parseMoney(amount) {
      return Number(amount.replace(/[^0-9\.]+/g,""));
    }
    var properties = [], propertiesAry = [], primitivePriceCurrency = "USD";
    var attrs = document.querySelectorAll(".sku-attributes");
    var configProductDetails = gilt.require.get("config.product_details");
    var looks = configProductDetails.productDetails.product.allLooks;
    var indexedLooks = {};
    for (var x in looks) {
      var tmpLook = looks[x];
      indexedLooks[tmpLook.productLookId] = tmpLook;
    }
    for (var x = 0; x < attrs.length; x++) {
      var attr = attrs[x];
      var tmpProperty = {};

      tmpProperty['name'] = attr.dataset.attributeName;
      tmpProperty['id'] = attr.dataset.attributeName;
      tmpProperty['data'] = {};

      var attrSwatches = attr.querySelectorAll(".sku-attribute-value");
      var tmpProperties = [];

      for (var m = 0; m < attrSwatches.length; m++) {
        var attrSwatch = attrSwatches[m];
        var tmpDesc = attrSwatch.dataset.valueName;
        var tmpID = attrSwatch.dataset.attributeValueId;
        var sample = "";
        var demo = "";
        var primitive_price = String(0);
        if (tmpProperty['name'].toLowerCase() == 'color') {
          var sampleEle = attrSwatch.querySelector("img.swatch-img");
          if (sampleEle) {
            sample = sampleEle.src;
          }

          var evt = document.createEvent('CustomEvent');
          evt.initCustomEvent('click', true, false);
          attrSwatch.dispatchEvent(evt);
          
          var selectedLookId = configProductDetails.selectedLookId;
          demo = indexedLooks[selectedLookId].tinyMainLookUrl;
          if (demo.indexOf("http") == -1) {
            demo = "http:" + demo;
          }
          primitive_price = document.querySelector("[itemprop=price]").innerText;
        }

        var tmpDimensionObject = {
          desc: tmpDesc
          , demo: demo
          , sample: sample
          , primitive_price: parseMoney(primitive_price)
          , primitive_price_currency: primitivePriceCurrency
          , exID: tmpID
        };

        tmpProperty['data'][tmpID] = tmpDimensionObject;
        tmpProperties.push(tmpID);
      }

      propertiesAry.push(tmpProperties);
      properties.push(tmpProperty);
    }

    return {
      "properties" : properties
      , "propertiesAry" : propertiesAry
    };
  });
  
  var properties = retProperties["properties"];
  var propertiesAry = retProperties["propertiesAry"];

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
  
  var tmpStock, stockValue, tmpTarget;
  for (var x in stocks) {
    tmpStock = stocks[x];
    for (var m in tmpStock) {
      if (m == 'soldout') continue;
      tmpTarget = tmpStock[m];

      this.evaluate(function(id, value) {
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent('click', true, false);
        var ele = document.querySelector(".sku-attributes[data-attribute-name='"+id+"'] .sku-attribute-value[data-attribute-value-id='"+value+"']");
        ele.dispatchEvent(evt);
      }, m, tmpTarget);
    }
    stockValue = this.evaluate(function() {
      return document.querySelector(".inventory-status.active") ? true : false;
    });
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
