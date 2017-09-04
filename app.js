var express = require('express');
const path = require('path');
var app = express();
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database("db/db.sqlite3");

app.use(express.static(path.join(__dirname, 'public')))

app.engine(".html", require("ejs").__express);
app.set("views", "./views");
app.set("view engine", "html");

app.get('/query_name', function(req, res) {
    console.time("query_name");
    var q = "%" + req.query.q + "%";
    var query = db.prepare("select * from ffwall where RoleName like $q");
    query.all({ $q: q }, function(err, result) {
        if (!err) {
            console.log("query_name " + req.query.q + " - " + result.length + " results");
            console.timeEnd("query_name");
            res.json(result);
        } else { console.log(err); }
    });
    query.finalize();
});

app.get('/query_chr', function(req, res) {
    console.time("query_chr");
    console.log("query_chr " + req.query.q);

    var cond = "Id = $q",
        q = req.query.q;
    if (isNaN(req.query.q)) {
        cond = "RoleName = $q";
    } else {
        q = parseInt(q);
    }

    var query = db.prepare("select * from ffwall where " + cond);
    query.get({ $q: q }, function(err, result) {
        if (!err && result) {
            result["success"] = true;
            console.log(result);
            res.json(result);
            console.timeEnd("query_chr");
        } else {
            if (err) console.log(err);
            res.json({ success: false });
        }
    });
});

app.get('/query_server', function(req, res) {
    console.time("query_server");
    var q = "%" + req.query.q + "%";
    var query = db.prepare("select * from ffwall where GroupName like $q");
    query.all({ $q: q }, function(err, result) {
        if (!err) {
            console.log("query_server " + req.query.q + " - " + result.length + " results");
            console.timeEnd("query_server");
            res.json(result);
        } else { console.log(err); }
    });
    query.finalize();
});

app.get('/:id?', function(req, res) {
    res.render("index", { id: req.params.id });
});
//app.use(express.static("static"));

var server = app.listen(process.env.PORT || 3005, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});