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

casper.on("remote.message", function(message) {
  this.echo("remote console.log: " + message);
});

casper.on('page.error', function (msg, trace) {
  this.echo( 'Error: ' + msg, 'ERROR' );
});

var retData = {};

casper.start(url);

casper.then(function() {
    var properties = [], stocks = [], propertiesAry = [];

    var retSize = this.evaluate(function() {
        var primitivePriceCurrency = "USD";
        var sizeID = "sizes";
        var sizeName = "size";

        var options = document.querySelectorAll("."+sizeID+" input");

        var size = {};
        size['name'] = sizeName;
        size['id'] = sizeID;
        size['data'] = {};

        var sizes = [];

        for (var i = 0; i < options.length; i++) {
            var tmpOption = options[i];

            var tmpDesc = tmpOption.dataset.name.trim();
            var tmpSample = "";
            var tmpDemo = "";
            var exID = tmpOption.id;

            var tmpObject = {
                desc: tmpDesc
                , demo: tmpDemo
                , sample: tmpSample
                , primitive_price: 0
                , primitive_price_currency: primitivePriceCurrency
                , exID: exID
            };

            size['data'][exID] = tmpObject;
            sizes.push(exID);
        }

        return {size:size, sizes:sizes};
    });

    var retColor = this.evaluate(function() {
        var primitivePriceCurrency = "USD";
        var colorID = "colors";
        var colorName = "color";

        var options = document.querySelectorAll("."+colorID+" input");

        var color = {};
        color['name'] = colorName;
        color['id'] = colorID;
        color['data'] = {};

        var colors = [];

        for (var i = 0; i < options.length; i++) {
            var tmpOption = options[i];

            var tmpDesc = tmpOption.dataset.name.trim();
            var tmpSample = "";

            tmpOption.click();

            var tmpDemo = document.querySelector(".main-image img").src;
            var exID = tmpOption.id;

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

    properties.push(retSize['size']);
    propertiesAry.push(retSize['sizes']);
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

            this.evaluate(function(id, value) {
                var selector = document.querySelector("#"+value);
                selector.click();
            }, m, tmpTarget);
        }

        stockValueColor = this.evaluate(function(id, value) {
            var selector = document.querySelector("#"+value);
            return selector.disabled;
        }, "colors", tmpStock["colors"]);

        stockValueSize = this.evaluate(function(id, value) {
            var selector = document.querySelector("#"+value);
            return selector.disabled;
        }, "sizes", tmpStock["sizes"]);

        if (!stockValueSize && !stockValueColor) {
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