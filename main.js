var app = require("./config/config");


var server = app.express();

server.use('/api/', require('./controllers/domains'))

.use(function(req, res, next){

    if(req.method != "GET"){
        res.status(405).json({ code: 405, message: 'Method '+req.method+' not allowed' });
    }else{
        res.status(404).json({ code: 404, message: 'Ressource not found' });
    }

});

server.listen(80);