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

    var retColor = this.evaluate(function() {
        var primitivePriceCurrency = "USD";

        var colorID = "colors";
        var colorName = "color";

        var colorOptions = document.querySelectorAll("."+colorID+" ul li");

        var color = {};
        color['name'] = colorName;
        color['id'] = colorID;
        color['data'] = {};

        var colors = [];

        for (var i = 0; i < colorOptions.length; i++) {
            var tmpOption = colorOptions[i];

            var tmpSwatchImg = tmpOption.querySelector("img");
            var tmpSwatchTip = tmpOption.querySelector(".inner");
            var tmpDesc = tmpSwatchTip.innerHTML.trim();
            var tmpSample = tmpSwatchImg.src;
            var tmpDemo = "";
            var exID = tmpDesc;

            var tmpObject = {
                desc: tmpDesc
                , demo: tmpDemo
                , sample: tmpSample
                , primitive_price: 0
                , primitive_price_currency: primitivePriceCurrency
                , exID: exID
            };

            color['data'][exID] = tmpObject;
            colors.push(exID);
        }

        return {color:color, colors:colors};
    });

    properties.push(retColor['color']);
    propertiesAry.push(retColor['colors']);

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
        stockValue = this.evaluate(function getStockStatus() {
            return true;
        });
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