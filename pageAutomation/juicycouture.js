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

var retData;

casper.start(url);

casper.then(function() {
    var properties = [], propertiesAry = [];
    var primitivePriceCurrency = "USD";

    var product = this.evaluate(function() {
        return __onestop_pageData.product;
    });

    var Inventory = product.Inventory;
    var InventoryObject = {};
    for (var i = 0; i < Inventory.length; i++) {
        var tmpInventory = Inventory[i];
        var tmpIndex = tmpInventory["ColorId"] + "_" + tmpInventory["SizeId"];
        InventoryObject[tmpIndex] = tmpInventory["IsInStock"];
    }

    var ProductColors = product.ProductColors;
    var ProductSizes = product.ProductSizes;

    var color = {};
    color['name'] = "color";
    color['id'] = "color";
    color['data'] = {};
    var colors = [];

    for (var i = 0; i < ProductColors.length; i++) {
        var tmpOption = ProductColors[i];
        var tmpID = tmpOption["Id"];
        var tmpDemo = tmpOption["ColorImageUrl"];
        var tmpSample = tmpOption["ColorSwatchUrl"];

        var tmpObject = {
            desc: tmpOption["ColorName"]
            , demo: tmpDemo.indexOf("http") > -1 ? tmpDemo : "http:" + tmpDemo
            , sample: tmpSample.indexOf("http") > -1 ? tmpSample : "http:" + tmpSample
            , primitive_price: 0
            , primitive_price_currency: primitivePriceCurrency
            , exID: tmpID
        };

        color['data'][tmpID] = tmpObject;
        colors.push(tmpID);
    }

    var size = {};
    size['name'] = "size";
    size['id'] = "size";
    size['data'] = {};
    var sizes = [];

    for (var i = 0; i < ProductSizes.length; i++) {
        var tmpOption = ProductSizes[i];
        var tmpID = tmpOption["Id"];

        var tmpObject = {
            desc: tmpOption["SizeName"]
            , demo: ""
            , sample: ""
            , primitive_price: 0
            , primitive_price_currency: primitivePriceCurrency
            , exID: tmpID
        };

        size['data'][tmpID] = tmpObject;
        sizes.push(tmpID);
    }

    properties.push(color);
    propertiesAry.push(colors);
    properties.push(size);
    propertiesAry.push(sizes);


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
        tmpTarget = [];
        for (var m in tmpStock) {
            if (m == 'soldout') continue;
            tmpTarget.push(tmpStock[m]);
        }
        var tmpIndex = tmpTarget.join("_");
        stockValue = InventoryObject[tmpIndex];
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
