var app = require("./config/config");
var Domain =  require('./models/domains');
var DomainLang =  require('./models/domains_lang');
var User =  require('./models/users');



var server = app.express;

server.get('/api/domains.:ext', function(req, res) {
    var ext = req.params.ext;
	res.setHeader('Content-Type', 'application/json');

	if (ext == "json") {
            Domain.getDomains(function(ds){
                res.send({ code: 200, message: 'success', datas: ds});
            });
        
	}else{
    	res.status(400).send({ code: 400, message: 'Bad request : Extension \''+ext+'\' not available', datas: []});
	}
    
})

.get('/api/domains/:domain.:ext', function(req, res) {
    var ext = req.params.ext;
    var domain = req.params.domain;
    res.setHeader('Content-Type', 'application/json');

    if (ext == "json") {
            Domain.getDomain(domain, function(d){
                if (d) {
                    User.getUser(d.user_id, function(u){
                        DomainLang.getDomainLangs(d.id, function(dl){

                            var datas = {langs: dl, id: d.id, slug: d.slug, name: d.name, description: d.description, creator: u, created_at: d.created_at}
                            res.send({ code: 200, message: 'success', datas: datas});

                        });
                    });  
                }else{
                    res.status(400).send({ code: 400, message: 'Bad request : Unknow domain \''+domain+'\'', datas: []});
                }
                
            });
        
    }else{
        res.status(400).send({ code: 400, message: 'Bad request : Extension \''+ext+'\' not available', datas: []});
    }
    
})

.use(function(req, res, next){
    res.setHeader('Content-Type', 'application/json');
    if(req.method != "GET"){
        res.status(405).send({ code: 405, message: 'Method '+req.method+' not allowed' });
    }else{
        res.status(404).send({ code: 404, message: 'Ressource not found' });
    }

});

server.listen(80);