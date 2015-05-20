module.exports = function($) {
  this.$ = $;
  this.getJSON = function() {
  	var obj = {};
  	obj.title = this.$("#s-title h1").text().trim();
    var pricelow = this.$("#s-price .ui-yen").last().text().split("-");
  	obj.price = pricelow[0].replace(/(^\s*)|(\s*$)/g, "");
    var imgs = Array();
    this.$("#s-showcase .main").find("img").each(function(i, elem){
      imgs.push($(this).attr("src"));
    });
    obj.img = imgs;
    obj.currency = "RMB";
    obj.en = 'mtmall';
  	return JSON.stringify(obj);
  };
}
