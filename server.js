var express = require('express');
var bodyParser = require('body-parser');
var spawn = require('child_process').spawn;
var natural = require('natural');
tokenizer = new natural.WordTokenizer();
var shrtntodise = require("./modules/sympt2dise.js");
var app = express(),data1 = [1,2,3,4,5,6,7,8,9];
var request = require('request');
var py = spawn('python3',['temp.py'])

var apidata = ""
/*var options = {
  url: 'https://api.infermedica.com/v2/diagnosis',
  method:'POST',
  json:true,
  headers: {
  app_id:'f1308345',
  app_key:'abb713ecd3ddecf6106ecf9118bfacde'
  },
  body:{}
  };
  var options1 = {
    url: 'https://api.infermedica.com/v2/symptoms',
    method:'GET',
    json:true,
    headers: {
    app_id:'f1308345',
    app_key:'abb713ecd3ddecf6106ecf9118bfacde'
    }
    };
    var options2 = {
      url: 'https://api.infermedica.com/v2/search?phrase=',
      method:'GET',
      json:true,
      headers: {
      app_id:'f1308345',
      app_key:'abb713ecd3ddecf6106ecf9118bfacde'
      }
      };
  var evi_format = {
  "id": "",
  "choice_id": "present"
  };

  var diagnosis_format = {
    "sex": "",
    "age": "",
    "evidence": []
  };*/

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('port', (process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080));
app.set('ip',(process.env.IP   || process.env.OPENSHIFT_NODEJS_IP  || '0.0.0.0'));
//var python_name = 'python';
/*if(process.env.MEDBOT_SERVICE_HOST)
{
  python_name='/var/lib/openshift/57c2ff777628e1c6210000af/app-root/data/bin/python';
}*/
app.use(express.static(__dirname +'/CSS'));
app.use(express.static(__dirname +'/JS'));
app.use(express.static(__dirname +'/SCSS'));
app.use(express.static(__dirname +'/views'));
app.use(express.static(__dirname +'/images'));
app.post('/query',function (req,res) {

  /*diagnosis_format = shrtntodise.restoreSessionVariables('staticuser');
  if(!diagnosis_format)
  diagnosis_format= {
    "sex": "",
    "age": "",
    "evidence": []
  };*/
  console.log("Message from client recieved and says ",req.body.key);

  py.stdout.on('data', function(data){
    apidata += data.toString();
    //console.log(apidata);
  });

  //res.json({key:apidata});
  py.stdout.on('end', function(){
    console.log(apidata);
    res.json({key:apidata});
  });


  py.stdin.write(req.body.key);
  py.stdin.end();


//  py.stdin.write(req.body.key, function(err){
//    py.stdin.end();
//  });


});

app.get('/fillData',function(req,res){

  request.get(options1,function(err,responce,body){
    if(err)
    {
      console.log(err);
    }
    if(body)
    {
      console.log("Body says",body)
      body.forEach(function(data) {
          shrtntodise.populateDBWithSymptoms(data);
      });
      res.json(body);
    }
    else {
      console.log("Problem with data retrieval");
      res.json("Problem");
    }

  });

});
app.get('/',function(req,res){
	res.sendFile(__dirname+'/views/index.html');
});

app.listen(app.get('port'), app.get('ip'), function() {
  console.log('Node app is running on port', app.get('port'),'On ip ',app.get('ip'));
});
/*

shrtntodise.shortdowntodiseaselist(symlist,function(err,disList){
  if(err)
  {
    console.log(err);
  }
  else {
  console.log("Got you"+disList);
  }

});

---------------------
var py    = spawn(python_name, ['nlpserver.py']);
var nlpdata='';
py.stdout.on('data', function(data){
  nlpdata += data.toString();
});
py.stdout.on('end', function(){
  console.log('Sum of numbers=',nlpdata);
  res.json({key:nlpdata+disList});
  console.log(req.body.key);
});
py.stdin.write(req.body.key);
py.stdin.end();*/
