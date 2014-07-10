module.exports = function($) {
  this.$ = $;
  this.getJSON = function() {
  	var obj = {};
  	obj.title = this.$("title").text();
    obj.price = this.$("#summary-price #jd-price").text();
  	return JSON.stringify(obj);
  };
}
