var express = require('express');


var app = express();

app.set('port',process.env.PORT||5000);
app.use(express.static(__dirname +'/CSS'));
app.use(express.static(__dirname +'/JS'));
app.use('/',function(req,res){
	res.sendFile(__dirname+'/views/index.html');
});

app.listen(app.get('port'),function(){
console.log("Node Server running at port "+app.get('port'));
});
