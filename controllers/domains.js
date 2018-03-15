var app = require("../config/config");
var controller = app.express.Router();

var Domain = app.model.domains;
var User = app.model.users;
var Translation = app.model.translations;


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
                    res.status(400).json({ code: 400, message: 'Bad request : Unknow domain \''+domain+'\'', datas: []});
                }
            });
    }else{
        res.status(400).json({ code: 400, message: 'Bad request : Extension \''+ext+'\' not available', datas: []});
    }
    
});

controller.route('/domains/:domain/translation.:ext')

.get(function(req, res) {

    var ext = req.params.ext;
    var domain = req.params.domain;

    if (ext == "json") {
            Domain.getDomain(domain, function(d){
                if (d) {
                    Translation.getTranslationsByDomain(d.id, function(t){

                        Translation.getTranslationsToLangByDomain(d.id, function(tl){
                            for (var i = 0; i < t.length; i++) {
                                t[i].trans = tl[t[i].id];
                                t[i].trans.PL = t[i].code;
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

module.exports = controller;