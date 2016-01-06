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
    var primitivePriceCurrency = "USD";
    var properties = [];
    var propertyIDs = [];
    var propertiesAry = [];

    var rawData = this.evaluate(function() {
        return sel_main;
    });

    var rawProperties = rawData.options.Properties;

    for (var i = 0; i < rawProperties.length; i++) {
        var tmpProperty = rawProperties[i];
        var tmpData = {};
        tmpData["name"] = tmpProperty["n"];
        tmpData["id"] = tmpProperty["a"];
        tmpData["data"] = {};
        var tmpIDs = [];
        for (var j = 0; j < tmpProperty["s"].length; j++) {
            var tmpOption = tmpProperty["s"][j];
            var tmpName = tmpOption["s"];
            var tmpID = tmpOption["i"];

            var tmpObject = {
                desc: tmpName
                , demo: ""
                , sample: ""
                , primitive_price: 0
                , primitive_price_currency: primitivePriceCurrency
                , exID: tmpID
            }

            tmpData["data"][tmpID] = tmpObject;
            tmpIDs.push(tmpID);
        }

        properties.push(tmpData);
        propertiesAry.push(tmpIDs);
    }

    var rawItems = rawData.options.Items;
    var syntheticItems = {};
    for (var i = 0; i < rawItems.length; i++) {
        var itemIDs = rawItems[i]["s"];
        var itemIndex = itemIDs.join("_");
        syntheticItems[itemIndex] = true;
    }

    var stockObj = {};
    var stockMapping = cartesianProduct(propertiesAry);
    for (var x in stockMapping) {
        var tmpRow = stockMapping[x];
        var tmpStock = {};
        var tmpIndex = [];
        for (var y in tmpRow) {
            var selectValue = tmpRow[y];
            var selector = properties[y].id;
            tmpStock[selector] = selectValue;
            tmpIndex.push(selectValue);
        }
        tmpStock['soldout'] = 1;
        var tmpIndexStr = tmpIndex.join("_");
        if (syntheticItems[tmpIndexStr]) {
            tmpStock['soldout'] = 0;
        }
        stockObj[tmpIndexStr] = tmpStock;
    }

    var stocks = [];
    for (var x in stockObj) {
        stocks.push(stockObj[x]);
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