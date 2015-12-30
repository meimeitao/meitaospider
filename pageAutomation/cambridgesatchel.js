var casper = require('casper').create({
    pageSettings: {
        loadImages:  false,
        //loadPlugins: false
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
    var properties = [], propertiesAry = [];

    var retColor = this.evaluate(function() {
        function parseMoney(amount) {
            return Number(amount.replace(/[^0-9\.]+/g,""));
        }

        var primitivePriceCurrency = "USD";
        var colorID = "Color";
        var colorName = "color";

        var colorOptions = document.querySelectorAll("."+colorID+" li a");
        var color = {};
        color['name'] = colorName;
        color['id'] = colorID;
        color['data'] = {};

        var colors = [];

        for (var i = 0; i < colorOptions.length; i++) {
            var tmpColorOption = colorOptions[i];

            var tmpDesc = tmpColorOption.title;
            try {
                var tmpSample = tmpColorOption.style.backgroundImage.match(/url\("?(.*)"?\)/)[1];
            } catch (e) {
                var tmpSample = "";
            }
            try {
                var tmpLgImgJSON = JSON.parse(tmpColorOption.dataset.lgimg);
                var tmpDemo = tmpLgImgJSON["url"];
            } catch (e) {
                var tmpDemo = "";
            }

            var tmpObject = {
                desc: tmpDesc
                , demo: tmpDemo
                , sample: tmpSample
                , primitive_price: 0
                , primitive_price_currency: primitivePriceCurrency
                , exID: tmpDesc
            };

            color['data'][tmpDesc] = tmpObject;
            colors.push(tmpDesc);
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
    this.exit();
});