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

    var productConfig = this.evaluate(function() {
        return RADLEY.productConfig;
    });

    var swatches = this.evaluate(function() {
        var swatchElements = document.querySelectorAll(".product-thumbnails a");
        var swatches = {};
        for (var i = 0; i < swatchElements.length; i++) {
            var tmpElement = swatchElements[i];

            var swatchImg = tmpElement.querySelector("img").src;
            swatches[tmpElement.dataset.colorId] = swatchImg;
        }
        return swatches;
    });

    for (var x in productConfig.attributes) {
        var tmpAttribute = productConfig.attributes[x];

        var tmpProperty = {};
        tmpProperty["name"] = tmpAttribute["label"];
        tmpProperty["id"] = tmpAttribute["id"];
        tmpProperty["data"] = {};

        var tmpOptions = tmpAttribute["options"];

        var tmpProperties = [];
        for (var i = 0; i < tmpOptions.length; i++) {
            var tmpOption = tmpOptions[i];

            var tmpObject = {
                desc: tmpOption["label"]
                , demo: ""
                , sample: swatches[tmpOption["id"]]
                , primitive_price: 0
                , primitive_price_currency: primitivePriceCurrency
                , exID: tmpOption["id"]
            }

            tmpProperty["data"][tmpOption["id"]] = tmpObject;
            tmpProperties.push(tmpOption["id"]);
        }

        properties.push(tmpProperty);
        propertiesAry.push(tmpProperties);
    }

    var stockMapping = cartesianProduct(propertiesAry);
    for (var x in stockMapping) {
        var tmpRow = stockMapping[x];
        var tmpStock = {};
        for (var y in tmpRow) {
            var selectValue = String(tmpRow[y]);
            var selector = properties[y].id;
            tmpStock[selector] = selectValue;
        }
        tmpStock['soldout'] = 0;
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