module.exports = function($) {
  this.$ = $;
  this.getJSON = function() {
  	var obj = {};
    var title = this.$("title").text();
  	obj.title = title.replace(/(^\s*)|(\s*$)/g, "");
    var price = this.$(".price #mall_price").text();
  	obj.price = price;
    var imgs = Array();
    this.$(".ac_container").find("img").each(function(i, elem){
      imgs.push($(this).attr("src").replace('60_60','350_350'));
    });
    obj.img = imgs;
    obj.currency = 'RMB';
  	return JSON.stringify(obj);
  };
}
