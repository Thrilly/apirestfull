var mysql               = require('mysql');
var params              = require('./parameters');

exports.fs 				= require('fs')
exports.morgan 			= require('morgan')
exports.path 			= require('path')
exports.bodyParser 		= require('body-parser')
exports.async 			= require('async')
exports.datetime		= require('node-datetime');

exports.express         = require('express');
exports.con             = mysql.createConnection(params.db);

exports.model           = {
    domains: require('../models/Domains'),
    users: require('../models/Users'),
    translations: require('../models/Translations'),
    lang: require('../models/Lang'),
};

exports.availableExt    = {
    json    :true,
    xml     :false,
    html    :false,
    json    :false,
};
