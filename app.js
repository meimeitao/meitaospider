var express = require('express');
var app = express();

app.get('/', function(req, res){
  app.set('view engine', 'jade');
  app.set('views', __dirname);
  res.render('index');
});

app.listen(3001, function(){
  console.log('Express is listing 3001');
});