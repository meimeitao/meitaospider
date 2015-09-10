var casper = require('casper').create({
  pageSettings: {
    loadImages:  false,
    loadPlugins: false,
    userAgent: 'Mozilla/5.0 (Windows; U; Windows NT 5.1; nl; rv:1.9.1.6) Gecko/20091201 Firefox/3.5.6'
  },
  timeout: 300000 //MS 5mins
});
var utils = require("utils");
var system = require('system');
var args = casper.cli.args;
var cartesianProduct = require('cartesian-product');

var url = args[0];

casper.on("remote.message", function(message) {
  this.echo("remote console.log: " + message);
});

casper.on('page.error', function (msg, trace) {
    this.echo( 'Error: ' + msg, 'ERROR' );
});

var retData = {};

casper.start(url, function() {
  this.evaluate(function() {
    var ue_t0 = ue_t0||+new Date();
  });
});

casper.then(function() {
  this.capture("runtime/screenshot_main.png");

  var retProperties = this.evaluate(function() {
    console.log(ue_t0);
    
    function parseMoney(amount) {
      return Number(amount.replace(/[^0-9\.]+/g,""));
    }
    
    var properties = [], propertiesAry = [], primitivePriceCurrency = "USD";
    var dimensionClasses = {'color':'dimension-color_name','size':'dimension-size_name'};

    for (var x in dimensionClasses) {
      var dimensionClass = dimensionClasses[x];
      var dimensionEle = document.querySelector("."+dimensionClass);
      console.log(dimensionEle);

      var dimensionVariantEles;
      if (x == 'color') {
        dimensionVariantEles = dimensionEle.querySelectorAll(".dimensionValuesContainer .swatchImage");
      } else if (x == 'size') {
        dimensionVariantEles = dimensionEle.querySelectorAll(".dimensionValuesContainer select option[value^='']");
      }

      var tmpProperty = {};

      tmpProperty['name'] = x;
      tmpProperty['id'] = x;
      tmpProperty['data'] = {};

      var tmpProperties = [];

      for (var i = 0; i < dimensionVariantEles.length; i++) {
        var variantEle = dimensionVariantEles[i];

        var tmpDesc = x == 'color' ? variantEle.dataset.name : variantEle.text;
        var tmpID = tmpDesc;
        var demo = "";
        var sample = "";
        var primitive_price = String(0);
        if (x == 'color') {
          sample = variantEle.querySelector("img").src;

          var evt = document.createEvent('CustomEvent');
          evt.initCustomEvent('click', true, false);
          variantEle.dispatchEvent(evt);

          demo = document.querySelector("#dpCenterImage img").src;
          primitive_price = document.querySelector("#ourPrice").text;
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

  utils.dump(retProperties);
});

casper.run(function() {
  //utils.dump(retData);
  this.exit();
});
