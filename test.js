//var config = require("./config.json");

var request = require('request');
var cheerio = require('cheerio');

var Parser = require('./parser/amazoncn.js');

request(
  "http://www.amazon.cn/Perrier%E5%B7%B4%E9%BB%8E%E5%A4%A9%E7%84%B6%E6%9C%89%E6%B0%94%E7%9F%BF%E6%B3%89%E6%B0%B4-330ml-3-330ml-3/dp/B00D3VYJEG/ref=sr_1_1?s=grocery&ie=UTF8&qid=1404397288&sr=1-1&keywords=Perrier%E5%B7%B4%E9%BB%8E%E6%B0%B4",
  function(error, result, body){
  	var $ = cheerio.load(body);
  	var p = new Parser($);
  	var j = p.getJSON();
  	console.log(j);
  }
);

