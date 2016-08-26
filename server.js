var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.set('port', (process.env.OPENSHIFT_NODEJS_PORT || 8080));
app.set('ip',(process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'));

app.use(express.static(__dirname +'/CSS'));
app.use(express.static(__dirname +'/JS'));
app.post('/query',function (req,res) {
  console.log(req.body.key);
  res.json({key:req.body.key});
});
app.get('/',function(req,res){
	res.sendFile(__dirname+'/views/index.html');
});

app.listen(app.get('port'), app.get('ip'), function() {
  console.log('Node app is running on port', app.get('port'),'On ip ',app.get('ip'));
});
