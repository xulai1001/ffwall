'use strict'
var express = require('express');
var timeout = require('connect-timeout');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var AV = require('leanengine');

var app = express();
var sqlite3 = require('sqlite3').verbose();

var db = new sqlite3.Database("db/db.sqlite3");
app.use(AV.express());
app.use(express.static(path.join(__dirname, 'public')))
// 设置默认超时时间
app.use(timeout('15s'));

app.engine(".html", require("ejs").__express);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "html");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

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
            console.log(result["RoleName"]);
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
app.use(function(req, res, next) {
    // 如果任何一个路由都没有返回响应，则抛出一个 404 异常给后续的异常处理器
    if (!res.headersSent) {
      var err = new Error('Not Found');
      err.status = 404;
      next(err);
    }
  });
  
  // error handlers
  app.use(function(err, req, res, next) {
    if (req.timedout && req.headers.upgrade === 'websocket') {
      // 忽略 websocket 的超时
      return;
    }
  
    var statusCode = err.status || 500;
    if (statusCode === 500) {
      console.error(err.stack || err);
    }
    if (req.timedout) {
      console.error('请求超时: url=%s, timeout=%d, 请确认方法执行耗时很长，或没有正确的 response 回调。', req.originalUrl, err.timeout);
    }
    res.status(statusCode);
    // 默认不输出异常详情
    var error = {};
    if (app.get('env') === 'development') {
      // 如果是开发环境，则将异常堆栈输出到页面，方便开发调试
      error = err;
    }
    res.render('error', {
      message: err.message,
      error: error
    });
  });
module.exports = app;