var mysql 			= require('mysql');
var params 			= require('./parameters');

exports.express 	= require('express')();
exports.con 		= mysql.createConnection(params.db);
