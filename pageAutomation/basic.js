var casper = require('casper').create({
  timeout: 300000 //MS 5mins
});

var utils = require("utils");
var system = require('system');
var args = casper.cli.args;

var url = args[0];
var retData = {};

//casper.on("remote.message", function(message) {
//  this.echo("remote console.log: " + message);
//});
//
//casper.on('page.error', function (msg, trace) {
//  this.echo( 'Error: ' + msg, 'ERROR' );
//});

casper.start(url);

casper.then(function() {
  retData = this.evaluate(function() {
    var minSize = 150;
    var tmpData = {};

    tmpData['url'] = document.documentURI;
    tmpData['title'] = document.title;
    var priceElement = document.querySelector("[itemprop='price']");
    tmpData['price'] = priceElement ? priceElement.innerText : "";
    var imgElements = document.querySelectorAll("img[src]");
    var img = "";
    for (var i = 0; i < imgElements.length; i++) {
      var tmpImage = imgElements[i];
      if (tmpImage.width >= minSize && tmpImage.height >= minSize) {
        img = tmpImage.src;
        break;
      }
    }
    tmpData['img'] = img;
    return tmpData;
  });
});

casper.run(function() {
  utils.dump(retData);
  this.exit();
});