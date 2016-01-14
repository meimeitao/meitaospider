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

    var dataJson = this.evaluate(function() {
        return BC.product;
    });

    var rawColorJson = dataJson.colorsCollection;
    var productID = dataJson.id;

    var color = {};
    color["name"] = "color";
    color["id"] = "color";
    color["data"] = {};
    var colors = [];
    for (var x in rawColorJson) {
        var tmpColor = rawColorJson[x];

        var tmpSample = tmpColor.images.thumbnailUrl;
        var tmpDemo = tmpColor.images.medium;
        var tmpName = tmpColor.title;
        var tmpAxes = tmpColor.axes;
        var tmpID;
        for (var m in tmpAxes) {
            var tmpAxe = tmpAxes[m].split("-");
            tmpID = tmpAxe[1];
            break;
        }

        var tmpObject = {
            desc: tmpName
            , demo: tmpDemo
            , sample: tmpSample
            , primitive_price: 0
            , primitive_price_currency: primitivePriceCurrency
            , exID: tmpID
        };

        color["data"][tmpID] = tmpObject;
        colors.push(tmpID);
    }
    properties.push(color);
    propertiesAry.push(colors);

    var rawSizeJson = dataJson.sizesCollection;
    var size = {};
    size["name"] = "size";
    size["id"] = "size";
    size["data"] = {};
    var sizes = [];
    for (var x in rawSizeJson) {
        var tmpObject = {
            desc: x
            , demo: ""
            , sample: ""
            , primitive_price: 0
            , primitive_price_currency: primitivePriceCurrency
            , exID: x
        };

        size["data"][x] = tmpObject;
        sizes.push(x);
    }
    properties.push(size);
    propertiesAry.push(sizes);

    var rawSkuData = dataJson.skusCollection;

    var stocks = [];
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
        var tmpIndexStr = productID + "-" + tmpIndex.join("-");
        tmpStock['soldout'] = rawSkuData[tmpIndexStr] ? 0 : 1;
        stocks.push(tmpStock);
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