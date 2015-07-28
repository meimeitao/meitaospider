module.exports = function($) {
  this.$ = $;
  this.getJSON = function() {
  	var obj = {};
    obj.redirectUrl = this.$("#J_Url").val();
  	return JSON.stringify(obj);
  };
};
