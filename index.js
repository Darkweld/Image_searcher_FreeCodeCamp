var mongodb = require("mongodb");
var MongoClient = mongodb.MongoClient;
var express = require('express');
var app = express();
var https = require("https");

var url = process.env.MONGODB_URI;

var db;

MongoClient.connect(url, function (err, database) {
    if (err) throw err;
    db = database;
    db.createCollection("searches", {capped:true, size: 100000, max: 10});
    app.listen(process.env.PORT||8080, function(){
        console.log("listening");
    });
});

app.get("/search/:search", function(req, res) {
    var searches = db.collection("searches");
    
    var date = new Date();
    searches.insert({"search": req.params.search, "timesearched" : date.toUTCString()});
    var offset = "";
    
    
    
    if (req.query.offset !== undefined && (isNaN(Number(req.query.offset))) === false) {
        offset = "&per_page=" + Number(req.query.offset);
    }
    
    https.get("https://api.unsplash.com/search/photos?client_id=34d4e422c5df88b7157fca9bb288124f3be7a2c5f2bdd19a437b6a59d33a6310&query="
    + req.params.search + offset, function(response) {
        var json = "";
        response.on("data", function(data) {
            json += data;
        });
        response.on("end", function() {
            json = JSON.parse(json)["results"];
            if (json.length === 0) return res.send("no results found");
            
            var resultarray = [];
            
            for (var i = 0; i < json.length; i++) {
                resultarray.push({imagelink: json[i].links.html,
                userprofile: json[i].user.links.html, thumbnail: json[i].urls.thumb});
            } 
            res.json(resultarray);
            
        });
        });
    
    
});
app.get("/recent", function (req, res) {
    var searches = db.collection("searches");
    searches.find({}, {_id: 0}).toArray(function(err, data) {
        if (err) throw err;
        res.json(data.reverse());
    });
});
app.get("/", function(req, res) {
    res.send("<p>To make a search, https://tranquil-everglades-57725.herokuapp.com/search/YOUR_TERM_HERE." +
    "<br>To add an offset to the search, https://tranquil-everglades-57725.herokuapp.com/search/YOUR_TERM_HERE?offset=YOUR_NUMBER_HERE" +
    "<br>To see recent searches, https://tranquil-everglades-57725.herokuapp.com/recent" +
    "<br> <span style = 'color: red;'>Courtesy of <a href='https://unsplash.com/developers'>Unsplash API</a></span></p>");
});