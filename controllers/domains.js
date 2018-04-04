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



// ####################### ROUTE 2 AND 8 #######################

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
            User.authenticate(req.header('Authorization'), d.id, function(authDomain){
                if (typeof req.header('Authorization') !== 'undefined'){
                    if (authDomain === false) {
                        callback(401, "Wrong token given");
                        return;
                    }else if(authDomain != d.id){
                        callback(403, "Access Denied");
                        return;
                    }else{
                        callback(null, d, true);
                    }
                }else{
                    callback(null, d, false);
                }
            });
        },

        function(d, authenticated, callback){
            User.getUser(d.user_id, function(u){
                Domain.getDomainLangs(d.id, function(dl){

                    var u_info = u;
                    if (!authenticated) {
                        u_info = {id : u.id, username: u.username};
                    }

                    var datas = {langs: dl, id: d.id, slug: d.slug, name: d.name, description: d.description, creator: u_info, created_at: d.created_at}
                    res.json({ code: 200, message: 'success', datas: datas});

                });
            }); 
        }

    ],function(err, msg) {
        if (err == 400) { res.status(err).json({ code: err, message: msg, datas:[]})} else {res.status(err).json({ code: err, message: msg})}
    });

});



// ####################### ROUTE 3 AND 7 #######################

controller.route('/domains/:domain/translations.:ext')

.get(function(req, res) {

    var ext = req.params.ext;
    var domain = req.params.domain;
    var code = req.query.code;

    async.waterfall([

        function(callback){
            Domain.getDomain(domain, function(d){
                if (ext != "json") {
                    callback(400, 'Bad request : Extension \''+ext+'\' not available');
                }else if (!d){
                    callback(404, 'Not Found : Unknow domain \''+domain+'\''); 
                }else if (typeof req.params.code !== 'undefined' && (req.params.code == '' || req.params.code == '\0' || req.params.code == '\\0' || req.params.code == null)){
                    callback(400, 'Bad Request : code parameter cannot be empty'); 
                }else{
                    callback(null, d); 
                }
            });
        },

        function(d, callback){
            if (typeof req.query.code === 'undefined'){

                // ROUTE 3
                Translation.getTranslationsByDomain(d.id, function(t){
                    callback(null, d, t)
                });

            }else{

                // ROUTE 7
                Translation.getTranslationsByDomainFilter(d.id, code, function(t){
                    callback(null, d, t)
                });
            }
        },

        function(d, t, callback){
            Lang.getDomainLangs(d.id, function(dl){
                callback(null, d, t, dl);
            });
        },

        function(d, t, dl, callback){
            
            if (typeof req.query.code === 'undefined'){

                // ROUTE 3
                Translation.getTranslationsToLangByDomain(d.id, function(tl){
                    for (var i = 0; i < t.length; i++) {
                        if (typeof tl[t[i].id] !== 'undefined') {
                            t[i].trans = tl[t[i].id];
                            for (var key in dl){
                                var idlang = dl[key];
                                if (typeof t[i].trans[idlang] === 'undefined') t[i].trans[idlang] = t[i].code;
                            }
                        }

                    }
                    res.json({ code: 200, message: 'success', datas: t});
                });

            }else{

                // ROUTE 7
                Translation.getTranslationsToLangByDomainFilter(d.id, code, function(tl){
                    for (var i = 0; i < t.length; i++) {
                        if (typeof tl[t[i].id] !== 'undefined') {
                            t[i].trans = tl[t[i].id];
                            for (var key in dl){
                                var idlang = dl[key];
                                if (typeof t[i].trans[idlang] === 'undefined') t[i].trans[idlang] = t[i].code;
                            }
                        }

                    }
                    res.json({ code: 200, message: 'success', datas: t});
                });
            }

        },

    ],function(err, msg) {
        if (err == 400) { res.status(err).json({ code: err, message: msg, datas:[]})} else {res.status(err).json({ code: err, message: msg})}
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
                return;
            } else if (typeof req.header('Content-Type') === 'undefined' && typeof req.header('Content-Type') === 'undefined') {
                callback(401, "Content-Type is required");
                return;
            } else {
                callback(null);
            }
        },

        function(callback){
            Domain.getDomain(domain, function(d){
                if (ext != "json") {
                    callback(400, 'Bad request : Extension \''+ext+'\' not available');
                    return;
                }else if (!d){
                    callback(404, 'Not Found : Unknow domain \''+domain+'\''); 
                    return;
                }else{
                    callback(null, d); 
                }
            });
        },

        

        function(d, callback){
            User.authenticate(req.header('Authorization'), d.id, function(authDomain){
                if (authDomain === false) {
                    callback(401, "Wrong token given");
                    return;
                }else if(authDomain != d.id){
                    callback(403, "Access Denied");
                    return;
                }else if(req.header('Content-Type') != "application/x-www-form-urlencoded" || req.header('Content-type') != "application/x-www-form-urlencoded"){
                    callback(401, "Invalid Content-Type");
                    return;
                }else{
                    callback(null, d);
                }
            });
        },

        function(d, callback){
            var requiredFields = ['code', 'trans'];
            for (var i = 0; i < requiredFields.length; i++) {
                if(typeof req.body[requiredFields[i]] === 'undefined' || req.body[requiredFields[i]] == '' || req.body[requiredFields[i]] == '\0' || req.body[requiredFields[i]] == '\\0'){
                    callback(400, '\''+requiredFields[i]+'\' parameter is missing');
                    return;
                }
            }
            callback(null, d);
        },

        function(d, callback){
            Lang.getRegexDomainLangs(d.id, function(reg){
                if (typeof req.body.trans != "object") {
                    callback(400, '\'trans\' need to be an array');
                }else{
                    for (var k in req.body.trans){
                        var regex = RegExp('['+reg+']{2}');
                        if (regex.test(k) === false) {
                            if (reg == '') {
                                callback(400, "No lang is registered in this domain");
                                return;
                            }
                            callback(400, "\'trans\' need registered iso code array keys ("+reg+")");
                            return;
                        }
                        if (req.body.trans[k].length == 0 || req.body.trans[k] == "\0" || req.body.trans[k] == "\\0") {
                            callback(400, '\'trans\' values cannot be empty');
                            return;
                        } 
                    }
                    callback(null, d);
                }
            });
        },

        function(d, callback){
            Lang.getDomainLangs(d.id, function(dl){
                callback(null, d, dl);
            });
        },

        function(d, dl, callback){
            Translation.setTranslations(d.id, dl, req.body.code, req.body.trans, function(result){
                if (typeof result.error === 'undefined') {
                    res.status(201).json({ code: 201, message: 'success', datas: result});
                }else{
                    callback(400, 'SQL MESSAGE : '+result.error);
                }
            });
        },

    ],function(err, msg) {
        if (err == 400) { res.status(err).json({ code: err, message: msg, datas:[]})} else {res.status(err).json({ code: err, message: msg})}
    });
    
});



// ####################### ROUTE 5 #######################

controller.route('/domains/:domain/translations/:idtrans.:ext')

.put(function(req, res) {
    var domain = req.params.domain;
    var ext = req.params.ext;
    var idtrans = req.params.idtrans;

    async.waterfall([

        function(callback) {
            if (typeof req.header('Authorization') === 'undefined'){
                callback(401, "Authorization is required");
                return;
            } else if (typeof req.header('Content-Type') === 'undefined' && typeof req.header('Content-Type') === 'undefined') {
                callback(401, "Content-Type is required");
                return;
            } else {
                callback(null);
            }
        },

        function(callback){
            Domain.getDomain(domain, function(d){
                if (ext != "json") {
                    callback(400, 'Bad request : Extension \''+ext+'\' not available');
                    return;
                }else if (!d){
                    callback(404, 'Not Found : Unknow domain \''+domain+'\''); 
                    return;
                }else{
                    callback(null, d); 
                }
            });
        },

        

        function(d, callback){
            User.authenticate(req.header('Authorization'), d.id, function(authDomain){
                if (authDomain === false) {
                    callback(401, "Wrong token given");
                    return;
                }else if(authDomain != d.id){
                    callback(403, "Access Denied");
                    return;
                }else if(req.header('Content-Type') != "application/x-www-form-urlencoded" || req.header('Content-type') != "application/x-www-form-urlencoded"){
                    callback(401, "Invalid Content-Type");
                    return;
                }else{
                    callback(null, d);
                }
            });
        },

        function(d, callback){
            var requiredFields = ['trans'];
            for (var i = 0; i < requiredFields.length; i++) {
                if(typeof req.body[requiredFields[i]] === 'undefined' || req.body[requiredFields[i]] == '' || req.body[requiredFields[i]] == '\\0'){
                    callback(400, '\''+requiredFields[i]+'\' parameter is missing');
                    return;
                }
            }
            callback(null, d);
        },

        function(d, callback){
            Lang.getRegexDomainLangs(d.id, function(reg){
                if (typeof req.body.trans != "object") {
                    callback(400, '\'trans\' need to be an array');
                    return;
                }else{
                    for (var k in req.body.trans){
                        var regex = RegExp('['+reg+']{2}');
                        if (regex.test(k) === false) {
                            if (reg == '') {
                                callback(400, "No lang is registered in this domain"); 
                                return;
                            }
                            callback(400, "\'trans\' need registered iso code array keys ("+reg+")");
                            return;
                        }
                        if (req.body.trans[k].length == 0 || req.body.trans[k] == "\0") {
                            callback(400, '\'trans\' values cannot be empty');
                            return;
                        } 
                    }
                    callback(null, d);
                }
            });
        },

        function(d, callback){
            Lang.getDomainLangs(d.id, function(dl){
                callback(null, d, dl);
            });
        },

        function(d, dl, callback){
            Translation.setTranslation(d.id, dl, idtrans, req.body.trans, function(result){
                if (typeof result.error === 'undefined') {
                    res.status(200).json({ code: 200, message: 'success', datas: result});
                }else{
                    callback(400, result.error);
                }
            });
        },

    ],function(err, msg) {
        if (err == 400) { res.status(err).json({ code: err, message: msg, datas:[]})} else {res.status(err).json({ code: err, message: msg})}
    });
    
});

// ####################### ROUTE 6 #######################

controller.route('/domains/:domain/translations/:idtrans.:ext')

.delete(function(req, res) {
    var domain = req.params.domain;
    var ext = req.params.ext;
    var idtrans = req.params.idtrans;

    async.waterfall([

        function(callback) {
            if (typeof req.header('Authorization') === 'undefined'){
                callback(401, "Authorization is required");
                return;
            } else {
                callback(null);
            }
        },

        function(callback){
            Domain.getDomain(domain, function(d){
                if (ext != "json") {
                    callback(400, 'Bad request : Extension \''+ext+'\' not available');
                    return;
                }else if (!d){
                    callback(404, 'Not Found : Unknow domain \''+domain+'\''); 
                    return;
                }else{
                    callback(null, d); 
                }
            });
        },

        

        function(d, callback){
            User.authenticate(req.header('Authorization'), d.id, function(authDomain){
                if (authDomain === false) {
                    callback(401, "Wrong token given");
                    return;
                }else if(authDomain != d.id){
                    callback(403, "Access Denied");
                    return;
                }else{
                    callback(null);
                }
            });
        },

        function(callback){
            Translation.getTranslationsById(idtrans, function(tl){
                if(tl.length == 0){
                    callback(400, "No translation with id "+idtrans);
                }
                callback(null);
            });
        },



        function(callback){
            Translation.deleteTranslations(idtrans, function(result){
                if (typeof result.error === 'undefined') {
                    res.status(200).json({ code: 200, message: 'success', datas: result});
                }else{
                    callback(400, result.error);
                }
            });
        },

    ],function(err, msg) {
        if (err == 400) { res.status(err).json({ code: err, message: msg, datas:[]})} else {res.status(err).json({ code: err, message: msg})}
    });
    
});

// ####################### ROUTE 9 #######################

// controller.route('/domains.:ext')

// .post(function(req, res) {

//     var ext = req.params.ext;

//     async.waterfall([]);

//     if (ext == "json") {
//         Domain.getDomains(function(ds){
//             res.json({ code: 200, message: 'success', datas: ds});
//         });
//     }else{
//         res.status(400).json({ code: 400, message: 'Bad request : Extension \''+ext+'\' not available', datas: []});
//     }

    
// });

module.exports = controller;