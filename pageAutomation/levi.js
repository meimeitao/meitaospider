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
        return JSON.parse(buyStackJSON);
    });

    var rawColorJson = dataJson.colorid;

    var color = {};
    color["name"] = "color";
    color["id"] = "colorid";
    color["data"] = {};
    var colors = [];
    for (var x in rawColorJson) {
        var tmpColor = rawColorJson[x];

        var tmpSample = tmpColor.swatch;
        var tmpDemo = tmpColor.gridUrl;
        var tmpName = tmpColor.finish.title;
        var tmpID = tmpColor.colorid;

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
    propertyIDs.push(color["id"]);
    propertiesAry.push(colors);

    var rawLengthJson = dataJson.attrs.length;
    if (rawLengthJson.length > 0) {
        var length = {};
        length["name"] = "length";
        length["id"] = "length";
        length["data"] = {};
        var lengthes = [];

        for (var i = 0; i < rawLengthJson.length; i++) {
            var tmpData = rawLengthJson[i];

            var tmpObject = {
                desc: tmpData
                , demo: ""
                , sample: ""
                , primitive_price: 0
                , primitive_price_currency: primitivePriceCurrency
                , exID: tmpData
            };

            length["data"][tmpData] = tmpObject;
            lengthes.push(tmpData);
        }

        properties.push(length);
        propertyIDs.push(length["id"]);
        propertiesAry.push(lengthes);
    }

    var rawSizeJson = dataJson.attrs.size;
    if (rawSizeJson.length > 0) {
        var size = {};
        size["name"] = "size";
        size["id"] = "size";
        size["data"] = {};
        var sizes = [];

        for (var i = 0; i < rawSizeJson.length; i++) {
            var tmpData = rawSizeJson[i];

            var tmpObject = {
                desc: tmpData
                , demo: ""
                , sample: ""
                , primitive_price: 0
                , primitive_price_currency: primitivePriceCurrency
                , exID: tmpData
            };

            size["data"][tmpData] = tmpObject;
            sizes.push(tmpData);
        }

        properties.push(size);
        propertyIDs.push(size["id"]);
        propertiesAry.push(sizes);
    }

    var rawWaistJson = dataJson.attrs.waist;
    if (rawWaistJson.length > 0) {
        var waist = {};
        waist["name"] = "waist";
        waist["id"] = "waist";
        waist["data"] = {};
        var waists = [];

        for (var i = 0; i < rawWaistJson.length; i++) {
            var tmpData = rawWaistJson[i];

            var tmpObject = {
                desc: tmpData
                , demo: ""
                , sample: ""
                , primitive_price: 0
                , primitive_price_currency: primitivePriceCurrency
                , exID: tmpData
            };

            waist["data"][tmpData] = tmpObject;
            waists.push(tmpData);
        }

        properties.push(waist);
        propertyIDs.push(waist["id"]);
        propertiesAry.push(waists);
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
        stockObj[tmpIndexStr] = tmpStock;
    }

    var rawSkuData = dataJson.sku;
    for (var x in rawSkuData) {
        var tmpSku = rawSkuData[x];
        var tmpIndex = [];
        for (var i = 0; i < propertyIDs.length; i++) {
            var tmpProperty = propertyIDs[i];
            tmpIndex.push(tmpSku[tmpProperty]);
        }
        var tmpIndexStr = tmpIndex.join("_");
        stockObj[tmpIndexStr]['soldout'] = 0;
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