var express = require('express');
var mongoClient = require("mongodb").MongoClient;
var hbs     = require('hbs');
var methodOverride = require('method-override')
var app = express();


hbs.registerHelper('ifCond', function(v1, v2, options) {
  if(v1 == v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});


app.use(express.static('public'));
app.use(express.static('uploads'));
app.use(express.static('routes'));
app.use(methodOverride('_method'));


var url = 'mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false';
var db, localdb;
app.set("view engine" , hbs);
mongoClient.connect(url , { useNewUrlParser: true ,  useUnifiedTopology: true } ,function(err , client){
    if(err)
      throw err;
    app.locals.db = client.db('Blog');
     localdb = client.db('Blog');
})


var admin = require('./routes/admin');
var user = require('./routes/user');


app.get('/', function(req, res) {
  console.log(req.query.search)
  if(req.query.search){
    console.log(req.query.search)
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    localdb.collection('Blog').find({$or:[{$and:[{heading : regex} , {status : 1}]},{$and:[{category : regex} , {status : 1}]},{$and:[{username : regex} , {status : 1}]}]}).toArray(function(err , data){
        if(err){
            throw err;
        }
        else{
        res.render('home.hbs' , {data : data , view : false , layout : false , style : '/userdashboard.css'}); 

        }
    }) 
}
else{
    console.log(req.query.search)
    localdb.collection('Blog').find({status : 1}).sort({date : -1}).limit(6).toArray(function(err , recent){ 
    localdb.collection('Blog').find({status : 1}).sort({views : -1}).limit(6).toArray(function(err , mostviewd){
        console.log(mostviewd)
        res.render('home.hbs' , {recent : recent ,mostviewd : mostviewd , view : true, layout : false , style : '/userdashboard.css'});     
    }) 
})
}
});



//--------------- Search Function-------------------

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

app.use('/admin', admin);
app.use('/user', user);


app.listen(process.env.PORT || 3000);

