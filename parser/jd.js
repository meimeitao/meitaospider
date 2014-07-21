module.exports = function($) {
  this.$ = $;
  this.getJSON = function() {
  	var obj = {};
  	obj.title = this.$("title").text();
    obj.price = this.$("#summary-price #jd-price").text();
    var imgs = Array();
    this.$("#spec-list .spec-items").find("img").each(function(i, elem){
      imgs.push($(this).attr("src").replace('n5','n1'));
    });
    obj.img = imgs;
    this.$("body").find("link").each(function(i, elem){
      obj.url = $(this).attr("href");
    });
    obj.currency = 'RMB';
    obj.en = 'jingdong';
  	return JSON.stringify(obj);
  };
}
