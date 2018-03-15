var mysql 			= require('mysql');
var params 			= require('./parameters');

exports.express 	= require('express');
exports.con 		= mysql.createConnection(params.db);

exports.model       =   {
                            domains: require('../models/domains'),
                            users: require('../models/users'),
                            translations: require('../models/translations'),
                        };

exports.requiredExt =   {
                            json:"json",
                        };
