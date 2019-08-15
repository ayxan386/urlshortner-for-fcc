'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
const bodyParser = require("body-parser");
const uuidV1 = require("uuid/v1");
const dns = require("dns");
var cors = require('cors');

var app = express();

var Schema = mongoose.Schema;
// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
const MONGO_URI = "mongodb+srv://name1000:76880A@cluster0-tzycp.mongodb.net/test?retryWrites=true&w=majority";
mongoose.connect(MONGO_URI,{useNewUrlParser: true});

var linkSchema = new Schema({
  origin: String,
  short: String
});

var Link = mongoose.model("Link",linkSchema);

app.use(cors());

app.use(bodyParser.urlencoded({extended : false}));
/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});

function done(err,data=null)
{
    if(err)console.error(err);
   console.log("data successfully added to database "+ data);
}

app.post("/api/shorturl/new", (req, res) => {
  //console.log("I am here");
  dns.lookup(req.body.url,(err,add) => {
    if(err){
      res.send({
         error: "invalid URL"
        });
    }
      let newLink = new Link({ origin: req.body.url, short: uuidV1().slice(-3) });
  //console.log(newLink);
  //console.log("I am here 2e");
  newLink.save().then(() => {
    res.send({
      original_url: newLink.origin,
      short_url: newLink.short
    });
  });
  });
});

app.get("/api/shorturl/:link", (req, res) => {
    // console.log(req.params.link);
  Link.findOne({ short: req.params.link }).then((data, err) => {
    if (err) console.log(err);
    // console.log(data);
    // res.send(data);
    res.redirect(301, data.origin);
  });
});
