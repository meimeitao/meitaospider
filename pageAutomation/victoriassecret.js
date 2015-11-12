var casper = require('casper').create({
  pageSettings: {
    loadImages:  false,
    loadPlugins: false,
    userAgent: 'Mozilla/5.0 (Windows; U; Windows NT 5.1; nl; rv:1.9.1.6) Gecko/20091201 Firefox/3.5.6'
  },
  timeout: 600000 //MS 10mins
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
  var retProperties = this.evaluate(function() {

    function parseMoney(amount) {
      return Number(amount.replace(/[^0-9\.]+/g,""));
    }

    var properties = [], propertiesAry = [], primitivePriceCurrency = "USD";
    var modules = document.querySelectorAll(".primary .module");
    for (var i = 0; i < modules.length; i++) {
      var module = modules[i];
      var tmpProperty = {};
      var tmpPropertyName = module.dataset.commonName;
      if (tmpPropertyName == 'quantity') continue;

      tmpProperty['name'] = tmpPropertyName;
      tmpProperty['id'] = tmpPropertyName;
      tmpProperty['data'] = {};

      var swatches = module.querySelectorAll("div span a");

      var tmpProperties = [];
      for (var m = 0; m < swatches.length; m++) {
        var swatch = swatches[m];
        var tmpLabel = swatch.querySelector("label");
        var tmpInput = tmpLabel.querySelector("input");
        if (!tmpInput.value) continue;

        var tmpDesc = tmpLabel.querySelector("span").innerText;
        var tmpIndex = tmpInput.value;
        var tmpSwatchImg = tmpLabel.querySelector("img");
        var tmpSample = tmpSwatchImg ? tmpSwatchImg.src : "";
        var tmpDemo = "";
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent('mousedown', true, false);
        tmpInput.dispatchEvent(evt);
        
        if (tmpInput.dataset.mainImage) {
          //tmpDemo = document.querySelector("#vsImage").src;
          tmpDemo = "http://dm.victoriassecret.com/product/404x539/" + tmpInput.dataset.mainImage;
        }
        var tmpPrice = String(0);
        //while (true) {
        //  var priceEle = document.querySelector(".primary .price-as-shown");
        //  if (priceEle) {
        //    tmpPrice = priceEle.innerText;
        //    break;
        //  }
        //}
        
        var tmpDimensionObject = {
          desc: tmpDesc
          , demo: tmpDemo
          , sample: tmpSample
          , primitive_price: parseMoney(tmpPrice)
          , primitive_price_currency: primitivePriceCurrency
          , exID: tmpIndex
        };

        tmpProperty['data'][tmpIndex] = tmpDimensionObject;
        tmpProperties.push(tmpIndex);
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
    //取消之前的选择
    this.evaluate(function() {
      var eles = document.querySelectorAll(".primary .module input:checked");
      for (var m = 0; m < eles.length; m++) {
        var ele = eles[m];
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent('mousedown', true, false);
        ele.dispatchEvent(evt);
      }
    });
    for (var m in tmpStock) {
      if (m == 'soldout') continue;
      tmpTarget = tmpStock[m];
      //选择属性
      this.evaluate(function(id, value) {
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent('mousedown', true, false);
        var ele = document.querySelector(".primary .module."+id+" input[value='"+value+"']");
        ele.dispatchEvent(evt);
      }, m, tmpTarget);
    }
    stockValue = this.evaluate(function() {
      var propertiesLength = document.querySelectorAll(".primary .module").length - 1;
      return document.querySelectorAll("input:checked").length == propertiesLength ? false : true;
    });
    //this.capture("./runtime/screencapture_"+x+".png");
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
  setTimeout(function() {
    casper.exit();
  }, 0);
});
