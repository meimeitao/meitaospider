module.exports = function($) {
  this.$ = $;
  this.getJSON = function() {
  	var obj = {};
  	obj.title = this.$("#title").text().trim();
    var pricelow = this.$("#price").last().text().split("-");
  	obj.price = pricelow[0].replace(/(^\s*)|(\s*$)/g, "");
    var imgs = Array();
    this.$("#imgSlider").find("img").each(function(i, elem){
      imgs.push($(this).attr("src"));
    });
    obj.img = imgs;
    obj.currency = "RMB";
    obj.en = 'mjd';
  	return JSON.stringify(obj);
  };
};
