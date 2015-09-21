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

casper.then(function() {
  var properties = [], stocks = [], propertiesAry = [];

  var retColor = this.evaluate(function() {
    function parseMoney(amount) {
      return Number(amount.replace(/[^0-9\.]+/g,""));
    }

    var primitivePriceCurrency = "USD";
    var colorID = "product-option-href";
    var colorName = "color";

    var colorOptions = document.querySelectorAll(".hidden-xs ."+colorID);

    var color = {};
    color['name'] = colorName;
    color['id'] = colorID;
    color['data'] = {};

    var colors = [];

    for (var i = 0; i < colorOptions.length; i++) {
      var tmpOption = colorOptions[i];

      var tmpSwatch = tmpOption.querySelector("img");
      var tmpDesc = tmpOption.dataset.selectName.trim();
      var tmpSample = tmpSwatch.src;

      var cloudzoomImage = tmpOption.dataset.cloudzoom.split(",")[2].split(":")[1].trim();
      var tmpDemo = cloudzoomImage;
      var exID = tmpOption.dataset.selectId;
      var tmpPrice = tmpOption.dataset.selectPrice;

      var tmpObject = {
        desc: tmpDesc
        , demo: tmpDemo
        , sample: tmpSample
        , primitive_price: parseMoney(tmpPrice)
        , primitive_price_currency: primitivePriceCurrency
        , exID: exID
      };

      color['data'][exID] = tmpObject;
      colors.push(exID);
    }

    return {color:color, colors:colors};
  });

  properties.push(retColor['color']);
  propertiesAry.push(retColor['colors']);

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
    for (var m in tmpStock) {
      if (m == 'soldout') continue;
      tmpTarget = tmpStock[m];
      this.evaluate(function setProperties(id, value) {
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent('click', true, false);
        var ele = document.querySelector("[data-select-id='"+value+"']");
        ele.dispatchEvent(evt);
      }, m, tmpTarget);
    }
    //this.capture('runtime/screenshot_'+x+'.png');
    stockValue = this.evaluate(function getStockStatus() {
      var stockStr = document.querySelector("#selectedOption").innerText.toLowerCase();
      return stockStr.indexOf("available") > -1 ? false : true;
    });
    if (stockValue) {
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