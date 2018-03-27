var app = require("../config/config");
var controller = app.express.Router();

var Domain = app.model.domains;
var User = app.model.users;
var Translation = app.model.translations;



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

    if (ext == "json") {
            Domain.getDomain(domain, function(d){
                if (d) {
                    User.getUser(d.user_id, function(u){
                        Domain.getDomainLangs(d.id, function(dl){

                            var datas = {langs: dl, id: d.id, slug: d.slug, name: d.name, description: d.description, creator: u, created_at: d.created_at}
                            res.json({ code: 200, message: 'success', datas: datas});

                        });
                    });  
                }else{
                    res.status(404).json({ code: 404, message: 'Not Found : Unknow domain \''+domain+'\''});
                }
            });
    }else{
        res.status(400).json({ code: 400, message: 'Bad request : Extension \''+ext+'\' not available', datas: []});
    }
    
});



// ####################### ROUTE 3 #######################

controller.route('/domains/:domain/translations.:ext')

.get(function(req, res) {

    var ext = req.params.ext;
    var domain = req.params.domain;

    if (ext == "json") {
            Domain.getDomain(domain, function(d){
                if (d) {
                    Translation.getTranslationsByDomain(d.id, function(t){
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

                    });  
                      
                }else{
                    res.status(400).json({ code: 400, message: 'Bad request : Unknow domain \''+domain+'\'', datas: []});
                }
            });
    }else{
        res.status(400).json({ code: 400, message: 'Bad request : Extension \''+ext+'\' not available', datas: []});
    }
    
});



// ####################### ROUTE 4 #######################

controller.route('/domains/:domain/translations.:ext')

.post(function(req, res) {
    var domain = req.params.domain;
    
    // *** HEADER ***
    if (typeof req.header('Authorization') !== 'undefined'){
        if(typeof req.header('Content-Type') !== 'undefined' && typeof req.header('Content-Type') !== 'undefined'){

            // *** PARAMS ***
            Domain.getDomain(domain, function(d){
                User.authenticate(req.header('Authorization'), d.id, function(authDomain){
                    if (authDomain !== false) {
                        if (authDomain == d.id){
                            if(req.header('Content-Type') == "application/x-www-form-urlencoded" || req.header('Content-type') == "application/x-www-form-urlencoded"){
                                var requiredFields = ['code', 'trans'];
                                var errorMsg = 'Bad Request : ';
                                var ext = req.params.ext;
                                
                                var error = false;

                                for (var i = 0; i < requiredFields.length; i++) {
                                    if(typeof req.body[requiredFields[i]] === 'undefined' || req.body[requiredFields[i]] == '' || req.body[requiredFields[i]] == '\\0'){
                                        errorMsg += '\''+requiredFields[i]+'\' is missing, ';
                                        error = true;
                                    }
                                }

                                if (!error) {
                                    if (typeof req.body.trans == "object") {
                                        for (var k in req.body.trans){
                                            var regex = RegExp('[A-Z]{2}');
                                            if (regex.test(k) == false) {
                                                if (!error) {
                                                    errorMsg += '\'trans\' need iso code array keys (like FR, EN, GB...),';
                                                    error = true;
                                                }
                                            }
                                            if (req.body.trans[k].length == 0 || req.body.trans[k] == "\0") {
                                                errorMsg += '\''+requiredFields[i]+'\' cannot be empty, ';
                                                error = true;
                                            }
                                        } 
                                    }else{
                                        errorMsg += '\'trans\' need to be an array, ';
                                        error = true;
                                    }
                                    
                                }
                                

                                if (!error) {
                                    if (ext == "json") {
                                        Domain.getDomain(domain, function(d){
                                            if (d) {
                                                
                                                Translation.setTranslations(d.id, req.body.code, req.body.trans, function(result){
                                                    if (typeof result.error === 'undefined') {
                                                        res.status(201).json({ code: 201, message: 'success', datas: result});
                                                    }else{
                                                        res.status(400).json({ code: 400, message: 'SQL MESSAGE : '+result.error, datas: []});
                                                    }
                                                    
                                                });  
                                                  
                                            }else{ 
                                                res.status(400).json({ code: 400, message: 'Bad request : Unknow domain \''+domain+'\'', datas: []});
                                            } // end if domain exist
                                        });

                                    }else{
                                        res.status(400).json({ code: 400, message: 'Bad request : Extension \''+ext+'\' not available', datas: []});
                                    } // end if write extension 
                                    
                                }else{
                                   res.status(400).json({ code: 400, message: errorMsg, datas: []}); 
                                }  // end if no errors
                            }else{
                                res.status(401).json({ code: 401, message: "Invalid Content-Type"}); 
                            }
                        }else{
                            res.status(403).json({ code: 401, message: "Access denied"}); 
                        }
                    }else{
                        res.status(401).json({ code: 401, message: "Wrong token given"}); 
                    }
                });
            });
        }else{
            res.status(401).json({ code: 401, message: "Content-Type is required"}); 
        }
    }else{
        res.status(401).json({ code: 401, message: "Authorization is required or right Content-Type is required"}); 
    }
    
});

module.exports = controller;