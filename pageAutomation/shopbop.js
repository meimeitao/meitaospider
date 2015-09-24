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

    var productDetail = this.evaluate(function() {
        return productDetail;
    });

    var productColors = productDetail.colors;
    var productSizes = productDetail.sizes;

    var skus = {};
    var color = {};
    color["name"] = "color";
    color["id"] = "Color";
    color["data"] = {};
    var colors = [];

    for (var x in productColors) {
        var tmpOption = productColors[x];
        var tmpID = tmpOption["color"];
        var tmpDesc = tmpOption["colorName"];
        var tmpSample = tmpOption["swatch"];
        var tmpDemo = tmpOption["images"]["slot-1"]["main"];

        var tmpObject = {
            desc: tmpDesc
            , demo: tmpDemo
            , sample: tmpSample
            , primitive_price: 0
            , primitive_price_currency: primitivePriceCurrency
            , exID: tmpID
        };

        color['data'][tmpID] = tmpObject;
        colors.push(tmpID);

        //颜色－尺寸
        var tmpSizes = tmpOption["sizes"];
        for (var i = 0; i < tmpSizes.length; i++) {
            var tmpSize = tmpSizes[i];
            var tmpIndex = tmpID +"_"+ tmpSize;
            skus[tmpIndex] = true;
        }
    }

    var size = {};
    size['name'] = "size";
    size['id'] = "size";
    size['data'] = {};
    var sizes = [];

    for (var x in productSizes) {
        var tmpOption = productSizes[x];
        var tmpID = tmpOption["sizeCode"];
        var tmpDesc = x;

        var tmpObject = {
            desc: tmpDesc
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
        stockValue = skus[tmpIndex] ? true : false;
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
