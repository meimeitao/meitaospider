module.exports = function($) {
  this.$ = $;
  this.getJSON = function() {
  	var obj = {};
  	obj.title = this.$(".dtif-h").text().trim();
    var pricelow = this.$("#item-price-line").last().text().split("-");
  	obj.price = pricelow[0].replace(/(^\s*)|(\s*$)/g, "");
    var imgs = Array();
    this.$(".dt-slct-ul").find("img").each(function(i, elem){
      imgs.push($(this).attr("src"));
    });
    obj.img = imgs;
    obj.currency = "RMB";
    obj.en = 'h5mtaobao';
  	return JSON.stringify(obj);
  };
};
