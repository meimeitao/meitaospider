module.exports = function($) {
  this.$ = $;
  //var escaper = require("true-html-escape");
  this.getJSON = function() {
  	var obj = {};
  	obj.title = this.$(".articalTitle h2").text();
    var content = this.$(".articalContent").html();
    //content = escaper.unescape(content);
    //replace
    if (content != null) {
      content = content.replace(/<p>/g, "\n");
      content = content.replace(/<\/p>/g, "\n");
      content = content.replace(/<br>/g, "\n");
      regex_a = /(<a([^>]+)>)/ig
      content = content.replace(regex_a, "");
      content = content.replace(/<\/a>/g, "");
      regex_img = /(<img([^>]+)>)/ig
      content = content.replace(regex_img, "#img#");
      regex = /(<([^>]+)>)/ig
      content = content.replace(regex, "");
    }
    obj.content = content;
    var imgs = Array();
    this.$(".articalContent").find("img").each(function(i, elem){
      imgs.push($(this).attr("real_src"));
    });
    obj.img = imgs;
  	return JSON.stringify(obj);
  };
}
