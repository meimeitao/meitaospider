var casper = require('casper').create({
    pageSettings: {
        loadImages:  false,
        loadPlugins: false,
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

casper.start(url);

casper.then(function() {
    var properties = [], propertiesAry = [];
    var primitivePriceCurrency = "EUR";

    var wishListOptions = this.evaluate(function() {
        return wishlistOptions;
    });

    var size = {};
    size['name'] = "size";
    size['id'] = "size";
    size['data'] = {};

    var sizes = [];

    for (var x in wishListOptions) {
        var tmpOption = wishListOptions[x];
        var tmpID = tmpOption["option_id"];

        var tmpObject = {
            desc: tmpOption["size"]
            , demo: ""
            , sample: ""
            , primitive_price: 0
            , primitive_price_currency: primitivePriceCurrency
            , exID: tmpID
        };

        size['data'][tmpID] = tmpObject;
        sizes.push(tmpID);
    }

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
        for (var m in tmpStock) {
            if (m == 'soldout') continue;
            tmpTarget = tmpStock[m];
        }
        stockValue = this.evaluate(function setProperties(id, value) {
            var ele = document.querySelector(".sizes a[onclick*='"+value+"']");
            return ele.className == 'addtowishlist' ? false : true;
        }, m, tmpTarget);
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