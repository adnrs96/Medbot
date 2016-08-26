var express = require('express');


var app = express();

app.set('port', (process.env.OPENSHIFT_NODEJS_PORT || 8080));
app.set('ip',(process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'));

app.use(express.static(__dirname +'/CSS'));
app.use(express.static(__dirname +'/JS'));
app.use('/',function(req,res){
	res.sendFile(__dirname+'/views/index.html');
});

app.listen(app.get('port'), app.get('ip'), function() {
  console.log('Node app is running on port', app.get('port'),'On ip ',app.get('ip'));
});
