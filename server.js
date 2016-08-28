var express = require('express');
var bodyParser = require('body-parser');
var spawn = require('child_process').spawn;

var app = express(),data1 = [1,2,3,4,5,6,7,8,9];
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.set('port', (process.env.OPENSHIFT_NODEJS_PORT || 8080));
app.set('ip',(process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'));
var python_name = 'python';
if(process.env.OPENSHIFT_NODEJS_IP)
{
  python_name='/var/lib/openshift/57c2ff777628e1c6210000af/app-root/data/bin/python';
}
app.use(express.static(__dirname +'/CSS'));
app.use(express.static(__dirname +'/JS'));
app.post('/query',function (req,res) {
  var py    = spawn(python_name, ['nlpserver.py']);
  var nlpdata='';
  py.stdout.on('data', function(data){
    nlpdata += data.toString();
  });
  py.stdout.on('end', function(){
    console.log('Sum of numbers=',nlpdata);
    res.json({key:nlpdata});
    console.log(req.body.key);
  });
  py.stdin.write(req.body.key);
  py.stdin.end();
});
app.get('/',function(req,res){
	res.sendFile(__dirname+'/views/index.html');
});

app.listen(app.get('port'), app.get('ip'), function() {
  console.log('Node app is running on port', app.get('port'),'On ip ',app.get('ip'));
});
