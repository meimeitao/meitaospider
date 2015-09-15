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
    var properties = [], stocks = [], propertiesAry = [];

    var retColor = this.evaluate(function() {
        function parseMoney(amount) {
            return Number(amount.replace(/[^0-9\.]+/g,""));
        }

        var primitivePriceCurrency = "USD";
        var colorID = "colorSelectBox";
        var colorName = "color";

        var colorOptions = document.querySelectorAll("."+colorID+" option");
        var color = {};
        color['name'] = colorName;
        color['id'] = colorID;
        color['data'] = {};

        var colors = [];

        for (var i = 0; i < colorOptions; i++) {
            var tmpOption = colorOptions[i];

            if (tmpOption.value == "") continue;

            var tmpDesc = tmpOption.innerText;
            var tmpSample =
        }

    });
});

casper.run(function() {
    utils.dump(retData);
    this.exit();
});
