var system = require('system');
var page = require('webpage').create();
var args = system.args;
if(args.length < 2){
    console.log("url can not be empty!");
    phantom.exit();
}
var url = args[1];

page.settings.resourceTimeout = 45000;
page.onResourceTimeout = function(e) {
    phantom.exit(1);
};
//page.onNavigationRequested = function(url, type, willNavigate, main) {
//  console.log(page.content);
//  phantom.exit();
//};
page.open(url, function (status) {
    //Page is loaded!
    var redirectUrl = page.evaluate(function() {
        return url;
    });
    console.log(redirectUrl);
    phantom.exit();
});