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
    var query = "select RoleName from ffwall where RoleName like \"%" + req.query.q.toString() + "%\"";
    db.all(query, function(err, result) {
        if (!err) {
            var ret = [];
            for (var i in result)
                ret.push(result[i]["RoleName"]);
            console.log("query_name " + req.query.q + " - " + ret.length + " results");
            console.timeEnd("query_name");
            res.json(ret);
        } else { console.log(err); }
    });
});

app.get('/query_chr', function(req, res) {
    console.time("query_chr");
    var query = "select * from ffwall where RoleName = \"" + req.query.q.toString() + "\"";
    db.all(query, function(err, result) {
        if (!err) {
            if (result.length > 0) {
                result[0]["success"] = true;
                console.log("query_chr " + req.query.q + " - " + result[0]);
                console.timeEnd("query_chr");
                res.json(result[0]);
            } else { res.json({ success: false }); }
        } else { console.log(err); }
    });
});

//app.use(express.static("static"));

var server = app.listen(process.env.PORT || 3005, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});
