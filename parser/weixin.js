module.exports = function($) {
  this.$ = $;
  this.getJSON = function() {
  	var obj = {};
  	obj.title = this.$("#page-content h2").text();
    var content = this.$(".rich_media_content").html();
    //replace
    if (content != null) {
      regex_p = /(<p([^>]+)>)/ig
      content = content.replace(regex_p, "\n");
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
    this.$(".rich_media_content").find("img").each(function(i, elem){
      imgs.push($(this).attr("data-src"));
    });
    obj.img = imgs;
    obj.url = '';
    var matched = /var msg_link = "(.+)#rd";/.exec($('script').text());
    if (matched) {
      obj.url = matched[1];
    }
  	return JSON.stringify(obj);
  };
}
