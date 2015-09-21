module.exports = function($) {
  this.$ = $;
  this.getJSON = function() {
    var obj = {};
    var title = this.$("title").text().split("-");
    obj.title = title[0].replace(/(^\s*)|(\s*$)/g, "");
    var price = this.$("[itemprop='price']").attr("content");
    obj.price = price;
    var imgs = Array();
    this.$(".alt_imgs").find("img").each(function(i, elem){
        imgs.push($(this).attr("src"));
    });
    obj.img = imgs;
    obj.currency = 'USD';
    obj.en = 'ashford';
    return JSON.stringify(obj);
  };
};