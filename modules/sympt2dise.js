module.exports = {};

  var mongo = require('mongodb');
  var MongoClient = mongo.MongoClient;
  var url ="mongodb://medbot:paank@ds029466.mlab.com:29466/medbot";//process.env.OPENSHIFT_MONGO_URL;
  var ObjectId = require('mongodb').ObjectID;
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
          symptoms.find({name:{$in:symlist},parent_id:"null"}).toArray(function(err,document){
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
        symptoms.find({name:{$in:symlist}}).toArray(function(err,document){
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
            symlist1.push(data.id);
          });
          callback(null,symlist1);
        }
        });
    }
  });
}

module.exports.restoreSessionVariables=function (id,callback)
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
      users.find({_id:ObjectId(id)}).toArray(function(err,document){
      if(err){
        console.log(err);
        db.close();
        callback(null);
      }
      else if(document.length<=0)
      {
        db.close();
        callback(null);
      }
      else {
        db.close();
        console.log(document);
        callback(document[0].session_data);
      }
      });
    }
  });
}

module.exports.updateSessionVariables=function (id,data,callback)
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
      if(id==null)
      {
            users.insert({
            session_data:data
          },function (err,doc) {
            if(err)
            console.log(err);
            else {
              console.log(doc);
              callback(doc.insertedIds[0]);
            }
          });
      }
      else {
          users.update({_id:ObjectId(id)},{
          _id:ObjectId(id),
          session_data:data
        },{ upsert: true },function (err,doc) {
            if(err)
            console.log(err);
          });
      }

    }
  });
}

module.exports.populateDBWithSymptoms=function (data)
{
  MongoClient.connect(url,function(err,db){
    if(err)
    {
      console.log(err);
    }
    else
    {
        var symptoms = db.collection('symptoms');
        symptoms.insert(data);
    }
  });
}
