var express = require('express'),
    app = express();

app.configure(function(){
  app.use('/assets', express.static(__dirname + '/assets'));
  app.use(app.router);
});

//index
app.get('*', function(req, res){
  res.sendfile('index.html');
});

app.listen(5000);