module.exports = {};

  var mongo = require('mongodb');
  var MongoClient = mongo.MongoClient;
  var url =process.env.OPENSHIFT_MONGO_URL;

  module.exports.shortdowntodiseaselist= function (symlist,callback)
  {
      MongoClient.connect(url,function(err,db){
        if(err)
        {
          console.log(err);
           callback(err,[]);
        }
        else
        {
          var symptoms = db.collection('symptoms');
          console.log("SymList "+symlist);
          symptoms.find({sym_name:{$in:symlist}}).toArray(function(err,document){
            //console.log("Doc"+document.length);
            var disList = [];
                if(err){
                console.log(err);
                 callback(err,[]);
              }
                else if(document.length>0)
                {
                  document.forEach(function (data) {
                    disList.push(data.disList);
                  });
                  console.log("Added disease list to master list for short down");
                }
                else
                {
                  // Code to see why symptom is not present in DB

                }

                db.close();
                console.log("disList:"+disList);
        // Performance update possible to algo for shortening of list
              if(disList.length)
              { callback(null,disList.reduce(function(prevList,curnList)
                {
                  var newList = []
                  prevList.forEach(function(data){
                    if(data in curnList)
                    {
                      newList.append(data);
                    }
                  });
                   return newList;
                }));
              }
              else{
             callback(null,[]);
           }
            });
          }
      });
    }

module.exports.isSymtomFilter=function (symlist,callback)
{
  MongoClient.connect(url,function(err,db){
    if(err)
    {
      console.log(err);
       callback(err);
    }
    else
    {
        var symptoms = db.collection('symptoms');
        symptoms.find({sym_name:{$in:symlist}}).toArray(function(err,document){
        if(err){
          console.log(err);
          callback(err);
        }
        else if(document.length<=0)
        {
          console.log("Message from DB:No symtom found for ",symlist);
          callback(null,[]);
        }
        else {
          console.log("Message from DB:symtom found for ",symlist);
          var symlist1 = [];
          document.forEach(function(data){
            symlist1.push(data.syn_api_id);
          });
          callback(null,symlist1);
        }
        });
    }
  });
}

module.exports.restoreSessionVariables=function (id)
{
  MongoClient.connect(url,function(err,db){
    if(err)
    {
      console.log(err);
       return null;
    }
    else
    {
      var users = db.collection('users');
      users.find({_id:id}).toArray(function(err,document){
      if(err){
        console.log(err);
        db.close();
        return null;
      }
      else if(document.length<=0)
      {
        db.close();
        return null;
      }
      else {
        db.close();
        return document.diagnosis_format;
      }
      });
    }
  });
}

module.exports.updateSessionVariables=function (id,data)
{
  MongoClient.connect(url,function(err,db){
    if(err)
    {
      console.log(err);
      return null;
    }
    else
    {
      var users = db.collection('users');
      users.update({_id:id},{
      _id:id,
      diagnosis_format:data
      },{
         upsert: true });
    }
  });
}
