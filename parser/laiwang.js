module.exports = function($) {
  this.$ = $;
  this.getJSON = function() {
  	var obj = {};
    var scripts = this.$("script");
    var pageData;
    try {
      scripts.each(function() {
        var text = $(this).text();
        if (text.indexOf("var pageData") > -1) {
          var tmpData = text.trim().split("=");
          var tmpJSONStr = tmpData[1].trim();
          if (tmpJSONStr[tmpJSONStr.length - 1] == ';') {
            tmpJSONStr = tmpJSONStr.substr(0,tmpJSONStr.length - 1);
          }
          pageData = JSON.parse(tmpJSONStr);
        }
      });
      if (pageData) {
        obj.redirectUrl = pageData['actionRule'][0]['url'];
      }
    } catch (err) {
      //do nothing
      console.log(err);
    }
    console.log(obj);
  	return JSON.stringify(obj);
  };
};
