module.exports = function($) {
  this.$ = $;
  this.getJSON = function() {
  	var obj = {};
    var scripts = this.$("script");
    var pageData;
    scripts.each(function() {
      var text = $(this).text();
      if (text.indexOf("var pageData") > -1) {
        pageData = JSON.parse(text.split("=")[1]);
      }
    });
    if (pageData) {
      console.log(pageData);
      obj.redirectUrl = pageData['actionRule'][0]['url'];
    }
    console.log(obj);
  	return JSON.stringify(obj);
  };
};
