module.exports = function($) {
  this.$ = $;
  this.getJSON = function() {
  	var obj = {};
    var title = this.$("title").text().split("-");
  	obj.title = title[0].replace(/(^\s*)|(\s*$)/g, "");
    var price = this.$("#prcIsum").text().split(" ");
  	obj.price = price[1];
    var imgs = Array();
    this.$("#vi_main_img_fs_fsThumbStrip").find("img").each(function(i, elem){
      imgs.push($(this).attr("src").replace('_14','_12'));
    });
    obj.img = imgs;
    obj.currency = 'USD';
    obj.en = 'ebay';
  	return JSON.stringify(obj);
  };
}
