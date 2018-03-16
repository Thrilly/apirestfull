var app = require("./config/config");

var fs = app.fs;
var morgan = app.morgan;
var path = app.path;

var server = app.express();

var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'})

server.use(morgan('combined', {stream: accessLogStream}));
server.use(app.bodyParser.urlencoded({extended: true}));

server.use('/api/', require('./controllers/domains'))

.use(function(req, res, next){

    if(req.method != "GET"){
        res.status(405).json({ code: 405, message: 'Method '+req.method+' not allowed for this ressource' });
    }else{
        res.status(404).json({ code: 404, message: 'Ressource not found' });
    }

});

server.listen(80);