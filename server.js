var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var spawn = require('child_process').spawn;
var nlp = require('natural');
//var shrtntodise = require("./modules/sympt2dise.js");
var request = require('request');
var jsonfile = require("./modules/data.json");

var apidata = "";
var symlist = [] ;
var probable_conditions = [];
var resp_from_api= "";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('port', (process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080));
app.set('ip',(process.env.IP   || process.env.OPENSHIFT_NODEJS_IP  || '0.0.0.0'));

app.use(express.static(__dirname +'/CSS'));
app.use(express.static(__dirname +'/JS'));
app.use(express.static(__dirname +'/SCSS'));
app.use(express.static(__dirname +'/views'));
app.use(express.static(__dirname +'/images'));

app.post('/query',function (req,res) {

  console.log(req.body.key);
  var symptom;
  var py = spawn('python3',['temp.py']);

  if(req.body.key == 'exit'){
    console.log("Entered exit");

    py.stdout.on('data', function(data){
        apidata = " ";
        apidata += data.toString();
        apidata = JSON.parse(apidata);
        //console.log(typeof apidata);
        //console.log(apidata.symptom);
        probable_conditions = apidata.conditions.slice(0).sort(function(a, b) {
              return b.probability - a.probability;
        }).slice(0,4);
        console.log(probable_conditions)
        symlist.length = 0;
        resp_from_api = "Probable conditions depending on your symptoms:";
        for(var i = 0; i < probable_conditions.length; i++){
          resp_from_api += "(" + (i+1).toString() + ") " + probable_conditions[i].name + " Chances: " + (probable_conditions[i].probability*100) + "%" ;
        }
        //for(var i = 0; i < apidata.question.items.length; i++)
        //  resp_from_api += "(" + (i+1).toString() + ") " + apidata.question.items[i].name + " " ;
        symlist.length = 0;
        apidata = "";
        res.json({key:resp_from_api});
    });

    /*py.stdout.on('end', function(){
      apidata = JSON.parse(apidata);
      //console.log(typeof apidata);
      console.log(apidata.symptom);
      probable_conditions = apidata.conditions.slice(0).sort(function(a, b) {
            return b.probability - a.probability;
      }).slice(0,4);
      symlist.length = 0;
      resp_from_api = "Probable conditions depending on your symptoms:";
      for(var i = 0; i < probable_conditions; i++){
        resp_from_api += "(" + (i+1).toString() + ") " + probable_conditions[i].name + " " ;
      }
      //for(var i = 0; i < apidata.question.items.length; i++)
      //  resp_from_api += "(" + (i+1).toString() + ") " + apidata.question.items[i].name + " " ;

      res.json({key:resp_from_api});
    });*/

    py.stderr.on('data',function (data) {
          console.log('err data: ' + data);
      }
    );

    py.stdin.write(JSON.stringify(symlist));
    py.stdin.end();
  }
  else{

  if(!apidata){
    console.log("initial");
    symptom = jsonfile.map(function(item){
      if((10 * nlp.JaroWinklerDistance(req.body.key, item.name)) > 6)
        return { name: item.name, id:item.id, match:(10 * nlp.JaroWinklerDistance(req.body.key,item.name))};
    }).sort(function(a,b){ return b.match - a.match;})[0].id;
    console.log("symptom", symptom);
    symlist.push({id: symptom, choice_id: 'present'});

  }
  else{
    //console.log(apidata.question.items)

    for(var i = 0; i < apidata.question.items.length; i++){
      if(apidata.question.items[i].name == req.body.key || i == (req.body.key - 1) || req.body.key == "Yes" || req.body.key == "yes"){
          symlist.push({id:apidata.question.items[i].id , choice_id: 'present'});
      }
      else{
         symlist.push({id:apidata.question.items[i].id , choice_id: 'absent'});
      }
    }
    //console.log("symptom", symptom);
  }

  console.log("Send these symp to python code:", symlist);

  py.stdout.on('data', function(data){
      //console.log("1");
      apidata = "";
      apidata += data.toString();
      //console.log(apidata);
      apidata = JSON.parse(apidata);

      //console.log(apidata.symptoms);
      console.log(apidata.symptom)
      resp_from_api = apidata.question.text;
      if(apidata.question.items.length > 1){
      for(var i = 0; i < apidata.question.items.length; i++)
        resp_from_api += "(" + (i+1).toString() + ") " + apidata.question.items[i].name + " " ;
      }
      res.json({key:resp_from_api});
  });

  /*py.stdout.on('end', function(){
    console.log("2");
    apidata = JSON.parse(apidata);

    //console.log(apidata.symptoms);
    console.log(apidata.symptom)
    resp_from_api = apidata.question.text;
    if(apidata.question.items.length > 1){
    for(var i = 0; i < apidata.question.items.length; i++)
      resp_from_api += "(" + (i+1).toString() + ") " + apidata.question.items[i].name + " " ;
    }
    res.json({key:resp_from_api});
  });*/

  console.log("3");
  py.stdin.write(JSON.stringify(symlist));
  py.stdin.end();

 }

  /*----------------------------------------------
  var py = spawn('python3',['temp.py']);
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


  py.stdin.write(req.body.key + "\n" + symdata);
  py.stdin.end();
  ----------------------------------------*/

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
