var system = require('system');
var page = require('webpage').create();
var args = system.args;
if(args.length < 2){
  console.log("url can not be empty!");
  phantom.exit();
}
var url = args[1];
var postBody = "mytrakpakid=GB&mytrakpaknumber="+args[2];
page.settings.resourceTimeout = 45000;
page.onResourceTimeout = function(e) {
  console.log(page.content);
  phantom.exit(1);
};
page.open(url, 'POST', postBody, function (status) {
  //Page is loaded!
  console.log(page.content);
  phantom.exit();
});
