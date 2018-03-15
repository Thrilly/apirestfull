var mysql               = require('mysql');
var params              = require('./parameters');

exports.fs 				= require('fs')
exports.morgan 			= require('morgan')
exports.path 			= require('path')

exports.express         = require('express');
exports.con             = mysql.createConnection(params.db);

exports.model           = {
    domains: require('../models/Domains'),
    users: require('../models/Users'),
    translations: require('../models/Translations'),
};

exports.availableExt    = {
    json    :true,
    xml     :false,
    html    :false,
    json    :false,
};
