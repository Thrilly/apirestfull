var app = require("./config/config");

var server = app.express;

server.get('/api/domains:ext', function(req, res) {
	var ext = req.params.ext;
	res.setHeader('Content-Type', 'application/json');

	if (ext == ".json") {
            var Domain =  require('./models/domains');
            Domain.getDomains(function(result){
                res.send({ code: 200, message: 'success', datas: result});
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