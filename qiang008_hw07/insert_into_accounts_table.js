/*
TO DO:
-----
READ ALL COMMENTS AND REPLACE VALUES ACCORDINGLY
*/

var mysql = require("mysql");
var sha1 = require('sha1');

var con = mysql.createConnection({
  // host: "cse-curly.cse.umn.edu",
  host: "127.0.0.1",
  user: "root", // replace with the database user provided to you
  password: "", // replace with the database password provided to you
  // password: "108", // replace with the database password provided to you
  database: "C4131S18U103", // replace with the database user provided to you
  port: 3306
});

con.connect(function(err) {
  if (err) {
    throw err;
  };
  console.log("Connected!");

  var rowToBeInserted = {
    acc_name: 'alpha', // replace with acc_name chosen by you OR retain the same value
    acc_login: 'alpha', // replace with acc_login chosen by you OR retain the same vallue
    acc_password: sha1("bravo") // replace with acc_password chosen by you OR retain the same value
  };

  var sql = ``;
  con.query('INSERT tbl_accounts SET ?', rowToBeInserted, function(err, result) {
    if(err) {
      throw err;
    }
    console.log("Value inserted");
  });
});