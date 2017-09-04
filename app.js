var express = require('express');
const path = require('path');
var app = express();
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database("db/db.sqlite3");

app.use(express.static(path.join(__dirname, 'public')))

app.engine(".html", require("ejs").__express);
app.set("views", "./views");
app.set("view engine", "html");

app.get('/', function(req, res) {
    res.render("index");
});

app.get('/query_name', function(req, res) {
    console.time("query_name");
    var q="%" + req.query.q + "%";
    var query = db.prepare("select RoleName from ffwall where RoleName like $q");
    query.all({$q: q}, function (err, result) {
        if (!err) {
            var ret = [];
            for (var i in result)
                ret.push(result[i]["RoleName"]);
            console.log("query_name " + req.query.q + " - " + ret.length + " results");
            console.timeEnd("query_name");
            res.json(ret);
        } else { console.log(err); }
    });
    query.finalize();
});

app.get('/query_chr', function(req, res) {
    console.time("query_chr");
    var query = db.prepare("select * from ffwall where RoleName = $q");
    query.get({$q: req.query.q}, function(err, result) {
        if (!err) {
            result["success"] = true;
            res.json(result);
            console.timeEnd("query_chr");
        } else {
            console.log(err);
            res.json({success: false});
        }
    });
});

//app.use(express.static("static"));

var server = app.listen(process.env.PORT || 3005, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});
