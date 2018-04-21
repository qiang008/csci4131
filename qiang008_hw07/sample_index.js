// YOU CAN USE THIS FILE AS REFERENCE FOR SERVER DEVELOPMENT

// include the express module
var express = require("express");

// create an express application
var app = express();

// helps in extracting the body portion of an incoming request stream
var bodyparser = require('body-parser');

// fs module - provides an API for interacting with the file system
var fs = require("fs");

// helps in managing user sessions
var session = require('express-session');

// native js function for hashing messages with the SHA-1 algorithm
var sha1 = require('sha1');

// include the mysql module
var mysql = require("mysql");
// 连接数据库，创建连接池
// var con = mysql.createPool({
//   host: "cse-curly.cse.umn.edu",
//   user: "", // replace with the database user provided to you
//   password: "108", // replace with the database password provided to you
//   database: "C4131S18U103", // replace with the database user provided to you
//   port: 3306
// });

var con;
var xml2js = require('xml2js');
var xmlParser = new xml2js.Parser({explicitArray : false, ignoreAttrs : true});

fs.readFile('./sample_dbconfig.xml', function(err, res) {
  if (err) {
    return console.log(err);
  }
  xmlParser.parseString(res.toString(), function(err, res) {
    if (err) {
      return console.log(err);
    }
    con = mysql.createPool(res.dbconfig);
  })
});


var cookieParser = require('cookie-parser');

// apply the body-parser middleware to all incoming requests
app.use(cookieParser('csci4131secretkey'));

app.use(bodyparser.urlencoded({
  extended: true
}));

app.use(bodyparser.json());
// use express-session
// in mremory session is sufficient for this assignment
app.use(session({
  secret: "csci4131secretkey",
  saveUninitialized: true,
  cookie: {
    maxAge: 12 * 60 * 60 * 1000
  },
  resave: false
}));

// server listens on port 9007 for incoming connections
app.listen(9007,(() => console.log('Listening on port 9007!')));

// // GET method route for the favourites page.
// It serves favourites.html present in client folder
app.get('/favourites', function (req, res) {
  // ADD DETAILS...
  // 判断 session 里有木有 username 有则为登入了返回正确页面，没有重定向到登录页
  if (!req.session.username) {
    res.statusCode = 301
    res.redirect('/')
  } else {
    fs.readFile('view/favourites.html', function (err, html) {
      if (err) {
        throw err;
      }
      res.statusCode = 200;
      res.setHeader('Content-type', 'text/html');
      res.write(html);
      res.end();
    });
  }
});

// GET method route for the addPlace page.
// It serves addPlace.html present in client folder
app.get('/addPlace', function (req, res) {
  // ADD DETAILS...
  // 判断 session 里有木有 username 有则为登入了返回正确页面，没有重定向到登录页
  if (!req.session.username) {
    res.statusCode = 301
    res.redirect('/')
  } else {
    fs.readFile('view/addPlace.html', function (err, html) {
      if (err) {
        throw err;
      }

      res.statusCode = 200;
      res.setHeader('Content-type', 'text/html');
      res.write(html);
      res.end();
    });
  }
});

// GET method route for the login page.
// It serves login.html present in client folder
app.get('/', function (req, res) {
  // ADD DETAILS...
  // 判断 session 里有木有 username 有则为登入了返回favourites，没有重定向到登录页
  if (req.session.username) {
    res.statusCode = 301
    res.redirect('/favourites')
  } else {
    fs.readFile('view/index.html', function (err, html) {
      if (err) {
        throw err;
      }
      // console.log(req.session, req.session.username, 'req.session.username');
      res.statusCode = 200;
      res.setHeader('Content-type', 'text/html');
      res.write(html);
      res.end();
    });
  }
});
// 登入操作
app.post('/login', function (req, res) {

  // ADD DETAILS...
  let username = req.body['username']
  let password = sha1(req.body['password'])
  // console.log(password)
  // 创建数据库连接
  con.getConnection(function (err, connection) {
    if (err) {
      throw err
    }
    // console.log('connected')
    // 数据库查询语句
    var sqlUser = `select * from tbl_accounts where acc_login = ?`
    connection.query(sqlUser, [username], function (err, result) {
      if (err) {
        throw err;
      }
      // 如果用户名存在
      if (result.length) {
        // 判断是否是相通的用户名
        if (result[0].acc_login === username) {
          // 判断密码是否正确
          if (result[0].acc_password === password) {
            console.log('success')
            // 返回添加 place
            console.log(req, 'req')
            req.session.username = username;
            req.session.login = result[0].acc_login;
            req.session.acc_id = result[0].acc_id;
            res.statusCode = 301
            res.redirect('/favourites')
            // res.end()
          } else {
            // 密码错误
            console.log('password wrong')
            res.statusCode = 401;
            res.setHeader('Content-type', 'text/html');
            res.write('password wrong');
            res.end();
          }
        } else {
          // 用户名不匹配
          console.log('username wrong')
          res.statusCode = 401;
          res.setHeader('Content-type', 'text/html');
          res.write('username wrong');
          res.end();
        }
      } else {
        // 用户名不存在
        console.log('no user find')
        res.statusCode = 401;
        res.setHeader('Content-type', 'text/html');
        res.write('no user find');
        res.end();
      }
      // 关闭连接
      connection.release()
    });

  })

});

// GET method to return the list of favourite places
// The function queries the table tbl_places for the list of places and sends the response back to client
app.get('/getListOfFavPlaces', function (req, res) {
  // ADD DETAILS...
  // console.log('getListOfFavPlaces')
  con.getConnection(function (err, connection) {
    // 创建 sql 语句，为查询 tbl_places 内的全部
    var sql = `select * from tbl_places`
    connection.query(sql, function (err, result) {
      // console.log(result, 'resultresult')
      // 构建返回 data
      var temp = {
        res: {
          placeList: result
        }
      }
      res.statusCode = 200;
      // 设定返回类型为 json
      res.setHeader('Content-Type', 'application/json');
      res.write(JSON.stringify(temp));
      res.end();
      connection.release()
    })
  })
});

// POST method to insert details of a new place to tbl_places table
app.post('/postPlace', function (req, res) {
  // ADD DETAILS...
  // console.log('postPlace', req.body)
  con.getConnection(function (err, connection) {
    var sql = `INSERT tbl_places SET ?`;
    connection.query(sql, req.body, function (err) {
      if (err) {
        throw err
      }
      // console.log('insert success')
      res.status = 301
      res.redirect('/favourites')
    })
  })
});

app.get('/admin', function (req, res) {
  if (!req.session.username) {
    res.statusCode = 301
    res.redirect('/');
  } else {
    fs.readFile('view/admin.html', function (err, html) {
      if (err) {
        throw err;
      }
      res.statusCode = 200;
      res.setHeader('Content-type', 'text/html');
      html = html.toString().replace('<p class="navbar-text navbar-right current-login"></p>', '<p class="navbar-text navbar-right current-login">Welcome ' + req.session.login + '!</p>')
      res.write(html);
      res.end();
    });
  }
});

app.get('/admin/users', function(req, res) {
  con.getConnection(function (err, connection) {
    var sql = `SELECT acc_id as id, acc_login as login, acc_name as name FROM tbl_accounts`;
    connection.query(sql, function (err, response) {
      if (err) {
        // throw err
        console.log(err);
        return res.json({
          ec: 406,
          em: 'database error',
        });
      }
      console.log(response);
      return res.json({
        ec: 200,
        em: 'ok',
        data: response,
      });
    });
    connection.release();
  });
});

app.post('/admin/add-user', function(req, res) {
  if (!req.body.login || !req.body.name || !req.body.password) {
    return res.json({
      ec: 401,
      em: 'params error',
    });
  }
  var login = req.body.login;
  var name = req.body.name;
  var password = req.body.password;
  con.getConnection(function (err, connection) {
    var sql = `SELECT * FROM tbl_accounts WHERE acc_login = '${login}'`;
    connection.query(sql, function (err, response) {
      if (err) {
        // throw err
        console.log(err);
        return res.json({
          ec: 406,
          em: 'database error',
        });
      }
      // console.log(response);
      if (response && response.length) {
        return res.json({
          ec: 406,
          em: 'This login is used by another user',
        });
      }
      var insertData = {
        acc_name: name, 
        acc_login: login, 
        acc_password: sha1(password),
      };
      var insertSql = `INSERT tbl_accounts SET ?`;
      connection.query(insertSql, insertData, function(err, response) {
        if (err) {
          console.log(err);
          return res.json({
            ec: 406,
            em: 'database error',
          });
        }
        return res.json({
          ec: 200,
          em: 'ok',
        });
      });
      connection.release();
    })
  });
});

app.post('/admin/delete-user', function(req, res) {
  if (!req.body.id) {
    return res.json({
      ec: 401,
      em: 'params error',
    });
  }
  if (parseInt(req.session.acc_id) === parseInt(req.body.id)) {
    return res.json({
      ec: 402,
      em: 'Can not delete the user that is logged in',
    });
  }
  con.getConnection(function (err, connection) {
    var sql = `DELETE FROM tbl_accounts WHERE acc_id = ${req.body.id}`;
    connection.query(sql, function(err, response) {
      if (err) {
        console.log(err);
        return res.json({
          ec: 406,
          em: 'database error',
        });
      }
      return res.json({
        ec: 200,
        em: 'ok',
      });
    });
    connection.release();
  })
});

app.post('/admin/update-user', function(req, res) {
  if (!req.body.id) {
    return res.json({
      ec: 401,
      em: 'params error',
    });
  }
  var updateData = {};
  if (req.body.name) {
    updateData.acc_name = req.body.name;
  }
  if (req.body.login) {
    updateData.acc_login = req.body.login;
  }
  if (req.body.password) {
    updateData.acc_password = sha1(req.body.password);
  }
  
  con.getConnection(function (err, connection) {
    var sql = `SELECT * FROM tbl_accounts WHERE acc_login = '${req.body.login}' AND acc_id != ${req.body.id}`;
    connection.query(sql, function (err, response) {
      if (err) {
        // throw err
        console.log(err);
        return res.json({
          ec: 406,
          em: 'database error',
        });
      }
      // console.log(response);
      if (response && response.length) {
        return res.json({
          ec: 406,
          em: 'This login is used by another user',
        });
      }
      var sqlUpdate = `UPDATE tbl_accounts SET ? WHERE acc_id = ${req.body.id}`;
      connection.query(sqlUpdate, updateData, function(err, response) {
        if (err) {
          console.log(err);
          return res.json({
            ec: 406,
            em: 'database error',
          });
        }
        if (parseInt(req.session.acc_id) === parseInt(req.body.id)) {
          if (req.body.name) {
            req.session.username = req.body.name;
          }
          if (req.body.login) {
            req.session.login = req.body.login;
            return res.json({
              ec: 200,
              em: 'ok',
              data: req.body.login,
            });
          }
        }
        return res.json({
          ec: 200,
          em: 'ok',
        });
      });
      connection.release();
    });
  })
})

// POST method to validate user login
// upon successful login, user session is created
app.post('/validateLoginDetails', function (req, res) {
  // ADD DETAILS...
});

// log out of the application
// destroy user session
app.get('/logout', function (req, res) {
  // ADD DETAILS...
  req.session.destroy()
  res.status = 301
  res.redirect('/')
});

// middle ware to server static files
app.use('/view', express.static(__dirname + '/view'));


// function to return the 404 message and error to client
app.get('*', function (req, res) {
  // add details
  fs.readFile('view/404.html', function (err, html) {
    if (err) {
      throw err;
    }
    res.statusCode = 200;
    res.setHeader('Content-type', 'text/html');
    res.write(html);
    res.end();
  });
});
