var mongodb = require("mongodb");
var MongoClient = mongodb.MongoClient;
var express = require('express');
var app = express();

var url = "mongodb://localhost:27017/searches";

var db;

MongoClient.connect(url, function (err, database) {
    if (err) throw err;
    db = database;
    app.listen(process.env.PORT||8080, function(){
        console.log("listening");
    });
});