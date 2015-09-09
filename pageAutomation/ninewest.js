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

var retData = {};

casper.start(url);

casper.then(function() {

  var retProperties = this.evaluate(function() {

    function parseMoney(amount) {
      return Number(amount.replace(/[^0-9\.]+/g,""));
    }

    var properties = [], propertiesMapping = {}, propertiesAry = [];
    var primitivePriceCurrency = "USD";
      
    
  });
  
});

casper.run(function() {
  utils.dump(retData);
  this.exit();
});
