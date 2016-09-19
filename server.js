var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var spawn = require('child_process').spawn;
var natural = require('natural');
tokenizer = new natural.WordTokenizer();
var jsonfile = require("./modules/data.json");
var shrtntodise = require("./modules/sympt2dise.js");
var app = express(),data1 = [1,2,3,4,5,6,7,8,9];
var request = require('request');
app.use(cookieParser());
var maletest = /male/i;
var femaletest = /female/i;
var agetest = /ageis/i;
var clearcook = /startnew/i;
var buffer = '';
var options = {
  url: 'https://api.infermedica.com/v2/diagnosis',
  method:'POST',
  json:true,
  headers: {
  app_id:'bc057cc8',
  app_key:'cb1d56dafc45383462d1bcbe754c9033'
  },
  body:{}
  };
  var options1 = {
    url: 'https://api.infermedica.com/v2/symptoms',
    method:'GET',
    json:true,
    headers: {
    app_id:'bc057cc8',
    app_key:'cb1d56dafc45383462d1bcbe754c9033'
    }
    };
    var options2 = {
      url: 'https://api.infermedica.com/v2/search?phrase=',
      method:'GET',
      json:true,
      headers: {
      app_id:'bc057cc8',
      app_key:'cb1d56dafc45383462d1bcbe754c9033'
      }
      };
  var evi_format = {
  "id": "",
  "choice_id": "present"
  };
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('port', (process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080));
app.set('ip',(process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0'));
var python_name = 'python';
/*if(process.env.MEDBOT_SERVICE_HOST)
{
  python_name='/var/lib/openshift/57c2ff777628e1c6210000af/app-root/data/bin/python';
}*/
app.use(express.static(__dirname +'/CSS'));
app.use(express.static(__dirname +'/JS'));
app.use(express.static(__dirname +'/SCSS'));
app.use(express.static(__dirname +'/views'));
app.use(express.static(__dirname +'/images'));
app.post('/cookclearquery',function (req,res) {
  var diagnosis_format = {
    "sex": "",
    "age": "",
    "evidence": []
  };
  if(clearcook.test(req.body.key))
  {
    var id = req.cookies.id;
    console.log("User id :",id);
    try{
   	id=JSON.parse(id);
   	}
   	catch(e)
   	{
   		console.log(e);
   	}
    var session_data = {};
    session_data['question_count']=0;
    session_data.diagnosis_format=diagnosis_format;
    shrtntodise.updateSessionVariables(null,session_data,function(idr){
      res.cookie('id',JSON.stringify(idr));
      id=idr;
      console.log("ID assignment :",idr);
      res.json({key:"Cleared"});
    });
  }

});
app.post('/query',function (req,res) {
  var diagnosis_format = {
    "sex": "",
    "age": "",
    "evidence": []
  };
  if(clearcook.test(req.body.key))
  {
    var id = req.cookies.id;
    console.log("User id :",id);
    try{
   	id=JSON.parse(id);
   	}
   	catch(e)
   	{
   		console.log(e);
   	}
    var session_data = {};
    session_data.diagnosis_format=diagnosis_format;
    session_data['question_count']=0;
    shrtntodise.updateSessionVariables(null,session_data,function(idr){
      res.cookie('id',JSON.stringify(idr));
      id=idr;
      console.log("ID assignment :",idr);
      api_handler(id,req,res,session_data,diagnosis_format);
    });
  }
  else {

    var id = req.cookies.id;
    console.log("User id :",id);
    try{
   	id=JSON.parse(id);
   	}
   	catch(e)
   	{
   		console.log(e);
    }
    session_data = {};
    session_data.diagnosis_format=diagnosis_format;
    session_data['question_count']=0;
    if(id==undefined)
    {
      shrtntodise.updateSessionVariables(null,session_data,function(idr){
        res.cookie('id',JSON.stringify(idr));
        id=idr;
        console.log("ID assignment :",idr);
        api_handler(id,req,res,session_data,diagnosis_format);
      });
    }
    else {
     shrtntodise.restoreSessionVariables(id,function(sess) {
       console.log(sess);
       if(sess==null)
       {
         shrtntodise.updateSessionVariables(null,session_data,function(idr){
           res.cookie('id',JSON.stringify(idr));
           id=idr;
           console.log("ID assignment :",idr);
           api_handler(id,req,res,session_data,diagnosis_format);
         });
       }
       else {
         session_data=sess;
         api_handler(id,req,res,session_data,diagnosis_format);
       }
      });
    }
  }


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


function api_handler(id,req,res,session_data,diagnosis_format) {

  diagnosis_format = session_data.diagnosis_format;

  if(!diagnosis_format)
  {
    session_data.sexf=false;
    session_data.agef=false;
      diagnosis_format= {
      "sex": "",
      "age": "",
      "evidence": []
    };
  }
  //console.log(session_data);
  console.log("Message from client recieved and says ",req.body.key);
  natural.PorterStemmer.attach();
  if(maletest.test(req.body.key))
  {
    diagnosis_format['sex']='male';
  }
  if(femaletest.test(req.body.key))
  {
    diagnosis_format['sex']='female';
  }

   if(agetest.test(req.body.key))
  {
    var ageed = req.body.key.split('ageis')[1].split(' ')[0];
    diagnosis_format['age']=ageed;
    session_data.diagnosis_format=diagnosis_format;
    shrtntodise.updateSessionVariables(id,session_data);
    res.json({key:"Fine lets begin your diagnosis"});
  }
  else {

    var symlist = [];//tokenizer.tokenize(req.body.key);//req.body.key.tokenizeAndStem();

    console.log("initial");
    var symptomonlyfirst = jsonfile.map(function(item){
      if((10 * natural.JaroWinklerDistance(req.body.key, item.name)) > 6)
        return { name: item.name, id:item.id, match:(10 * natural.JaroWinklerDistance(req.body.key,item.name))};
    }).sort(function(a,b){ return b.match - a.match;})[0].id;
    console.log("symptom", symptomonlyfirst);
    symlist.push({id: symptomonlyfirst, choice_id: 'present'});

    console.log("Here:",diagnosis_format['sex']);
    session_data.diagnosis_format=diagnosis_format;
    console.log(session_data);
    if(diagnosis_format['sex']=='')
    {
      if(session_data['sexf'])
      {
        res.json({key:"I am sorry but i need that information"});
        shrtntodise.updateSessionVariables(id,session_data);
      }
      else {
        res.json({key:"Could you let me know your sex enter as 'male' or 'female'"});
        session_data['sexf']=1;
        shrtntodise.updateSessionVariables(id,session_data);
      }
    }
    else if(diagnosis_format['age']=='')
    {
      if(session_data['agef'])
      {
        res.json({key:"I am sorry but i need that information"});
        shrtntodise.updateSessionVariables(id,session_data);
      }
      else {
        res.json({key:"Could you let me know your Age Please text me in following way So if you age is say 29 then send Ageis29 "});
        session_data['agef']=1;
        shrtntodise.updateSessionVariables(id,session_data);
      }
    }
    else {

      /*for(var i=0;i<symlist.length;i++)
      {
        symlist[i]=new RegExp(symlist[i],"i");
      }
      console.log(symlist);
      */
      if(session_data.qtype && session_data.qtype.items.length>0)
      {
        console.log("Choice symptom code executing");
        console.log(session_data.qtype.items);
        for(var i = 0; i < session_data.qtype.items.length; i++){
          var new_evi_form = evi_format;
          new_evi_form.id=session_data.qtype.items[i].id;
          if(((10 * natural.JaroWinklerDistance(session_data.qtype.items[i].name, req.body.key)) > 6) || i == (req.body.key - 1) || req.body.key == "Yes" || req.body.key == "yes")
          {
              new_evi_form.choice_id='present';
          }
          else{
             new_evi_form.choice_id='absent';
          }
          diagnosis_format.evidence.push({id:new_evi_form.id,choice_id:new_evi_form.choice_id});
          //console.log(new_evi_form);
        }
        options.body=diagnosis_format;
        console.log("diagnosis_format :",diagnosis_format.evidence);
        api_request_handler(options,session_data,diagnosis_format,req,res,id);

      }
      else {
        console.log("Symptoms Filter code executing");
        /*shrtntodise.isSymtomFilter(symlist,function(err,symlist){
          if(err)
          {
            console.log(err);
          }
          else
          {
              console.log(symlist);
              for(var i=0;i<symlist.length;i++)
              {
                  var new_evi_form = evi_format;
                  new_evi_form.id=symlist[i];
                  new_evi_form.choice_id='present';
                  diagnosis_format.evidence.push(new_evi_form);
              }
              options.body=diagnosis_format;
              api_request_handler(options,session_data,diagnosis_format,req,res,id);
          }
        });*/
        diagnosis_format.evidence.push({id:symlist[0].id,choice_id:symlist[0].choice_id});
        options.body=diagnosis_format;
        console.log(diagnosis_format.evidence);
        api_request_handler(options,session_data,diagnosis_format,req,res,id);
      }
  }
}
}

function api_request_handler(options,session_data,diagnosis_format,req,res,id) {

  request.post(options,function(err,responce,body){
    try{
      if(err)
      {
        console.log(err);
      }
      if(body)
      {
        console.log("Body says",body);
        if(session_data.qtype)
        console.log(session_data.qtype.text,"  :  ",body.question.text);
        if((session_data.qtype && session_data.qtype.text==body.question.text)||session_data.question_count>7)
        {
          var customresponce = '';
          session_data.qtype=body.question;
          if(body.conditions.length>0)
          {
            customresponce='You could be suffering from following conditions<br>';
            for(var i=0;i<body.conditions.length && i<4;i++)
            {
              customresponce+=body.conditions[i].name+'<br>';
            }
          }
          else {
            customresponce = 'Can you describe more about your condition<br>Let me give you some symptoms you might wanna tell about<br>'+body.question.text;
            if(body.question.items.length)
            customresponce+='<br> Could you specify from below symptoms if any is present<br>';
            for(var i=0;i<body.question.items.length;i++)
            {
              customresponce+=body.question.items[i].name+'<br>';
            }
          }
          res.json({key:customresponce});
        }
        else {
          var customresponce = body.question.text;
          if(body.question.items.length)
          customresponce+='<br> Could you specify from below symptoms if any is present<br>';
          for(var i=0;i<body.question.items.length;i++)
          {
            customresponce+=body.question.items[i].name+'<br>';
          }
          res.json({key:customresponce});
          session_data.qtype=body.question;
          console.log("question_count before: ",session_data.question_count);
          session_data.question_count= parseInt(session_data.question_count)+1;
          console.log("question_count updated: ",session_data.question_count);
        }
      }
      else {
        res.json({key:"Sorry but i do not understand that Try something else"});
      }
    }
    catch(err){
      console.log(err);
      res.json({key:"Some error occured while connecting to brain"});
    }
    session_data.diagnosis_format=diagnosis_format;
    shrtntodise.updateSessionVariables(id,session_data);
  });

}
/*
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
