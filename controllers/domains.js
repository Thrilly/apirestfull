var app = require("../config/config");
var controller = app.express.Router();
var async = app.async;

var Domain = app.model.domains;
var User = app.model.users;
var Translation = app.model.translations;
var Lang = app.model.lang;



// ####################### ROUTE 1 #######################

controller.route('/domains.:ext')

.get(function(req, res) {

    var ext = req.params.ext;

    if (ext == "json") {
        Domain.getDomains(function(ds){
            res.json({ code: 200, message: 'success', datas: ds});
        });
    }else{
        res.status(400).json({ code: 400, message: 'Bad request : Extension \''+ext+'\' not available', datas: []});
    }

    
});



// ####################### ROUTE 2 #######################

controller.route('/domains/:domain.:ext')

.get(function(req, res) {

    var ext = req.params.ext;
    var domain = req.params.domain;

    async.waterfall([

        function(callback){
            Domain.getDomain(domain, function(d){
                if (ext != "json") {
                    callback(400, 'Bad request : Extension \''+ext+'\' not available');
                }else if (!d){
                    callback(404, 'Not Found : Unknow domain \''+domain+'\''); 
                }else{
                    callback(null, d); 
                }
            });
        },

        function(d, callback){
            User.getUser(d.user_id, function(u){
                Domain.getDomainLangs(d.id, function(dl){
                    var datas = {langs: dl, id: d.id, slug: d.slug, name: d.name, description: d.description, creator: u, created_at: d.created_at}
                    res.json({ code: 200, message: 'success', datas: datas});

                });
            }); 
        }

    ],function(err, msg) {
        if (err == 400) { res.status(err).json({ code: err, message: msg, data:[]})} else {res.status(err).json({ code: err, message: msg})}
    });

});



// ####################### ROUTE 3 #######################

controller.route('/domains/:domain/translations.:ext')

.get(function(req, res) {

    var ext = req.params.ext;
    var domain = req.params.domain;

    async.waterfall([

        function(callback){
            Domain.getDomain(domain, function(d){
                if (ext != "json") {
                    callback(400, 'Bad request : Extension \''+ext+'\' not available');
                }else if (!d){
                    callback(404, 'Not Found : Unknow domain \''+domain+'\''); 
                }else{
                    callback(null, d); 
                }
            });
        },

        function(d, callback){
            Translation.getTranslationsByDomain(d.id, function(t){
                callback(null, d, t)
            });
        },

        function(d, t, callback){
            Translation.getTranslationsToLangByDomain(d.id, function(tl){
                for (var i = 0; i < t.length; i++) {
                    if (typeof tl[t[i].id] !== 'undefined') {
                        t[i].trans = tl[t[i].id];
                        t[i].trans.PL = t[i].code;
                    }else{
                        t[i].trans = {"PL" : t[i].code};
                    }

                }
                res.json({ code: 200, message: 'success', datas: t});
            });
        }

    ],function(err, msg) {
        if (err == 400) { res.status(err).json({ code: err, message: msg, data:[]})} else {res.status(err).json({ code: err, message: msg})}
    });
    
});



// ####################### ROUTE 4 #######################

controller.route('/domains/:domain/translations.:ext')

.post(function(req, res) {
    var domain = req.params.domain;
    var ext = req.params.ext;

    async.waterfall([

        function(callback) {
            if (typeof req.header('Authorization') === 'undefined'){
                callback(401, "Authorization is required");
            } else if (typeof req.header('Content-Type') === 'undefined' && typeof req.header('Content-Type') === 'undefined') {
                callback(401, "Content-Type is required");
            } else {
                callback(null);
            }
        },

        function(callback){
            Domain.getDomain(domain, function(d){
                if (ext != "json") {
                    callback(400, 'Bad request : Extension \''+ext+'\' not available');
                }else if (!d){
                    callback(404, 'Not Found : Unknow domain \''+domain+'\''); 
                }else{
                    callback(null, d); 
                }
            });
        },

        function(d, callback){
            User.authenticate(req.header('Authorization'), d.id, function(authDomain){
                if (authDomain === false) {
                    callback(401, "Wrong token given");
                }else if(authDomain != d.id){
                    callback(403, "Access Denied");
                }else if(req.header('Content-Type') != "application/x-www-form-urlencoded" || req.header('Content-type') != "application/x-www-form-urlencoded"){
                    callback(401, "Invalid Content-Type");
                }else{
                    callback(null, d);
                }
            });
        },

        function(d, callback){
            var requiredFields = ['code', 'trans'];
            for (var i = 0; i < requiredFields.length; i++) {
                if(typeof req.body[requiredFields[i]] === 'undefined' || req.body[requiredFields[i]] == '' || req.body[requiredFields[i]] == '\\0'){
                    callback(400, '\''+requiredFields[i]+'\' parameter is missing');
                }
            }
            callback(null, d);
        },

        function(d, callback){
            Lang.getRegexLangs(function(reg){
                if (typeof req.body.trans != "object") {
                    callback(400, '\'trans\' need to be an array');
                }else{
                    for (var k in req.body.trans){
                        var regex = RegExp('['+reg+']{2}');
                        if (regex.test(k) === false) {
                            callback(400, "\'trans\' need registered iso code array keys");
                        }
                        if (req.body.trans[k].length == 0 || req.body.trans[k] == "\0") {
                            callback(400, '\'trans\' values cannot be empty');
                        } 
                    }
                    callback(null, d);
                }
            });
        },

        function(d, callback){
            Translation.setTranslations(d.id, req.body.code, req.body.trans, function(result){
                if (typeof result.error === 'undefined') {
                    res.status(201).json({ code: 201, message: 'success', datas: result});
                }else{
                    callback(400, 'SQL MESSAGE : '+result.error);
                }
            });
        },

    ],function(err, msg) {
        if (err == 400) { res.status(err).json({ code: err, message: msg, data:[]})} else {res.status(err).json({ code: err, message: msg})}
    });
    
});

module.exports = controller;