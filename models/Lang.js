var app = require("../config/config");

function Lang() {}

Lang.getLangs = function(callback){
	var sql = "SELECT code FROM lang";
    app.con.query(sql, function (err, result) {
       if (err) throw err;
       return callback(result);
    });
};

Lang.getRegexLangs = function(callback){
	var sql = "SELECT code FROM lang";
    app.con.query(sql, function (err, result) {
       if (err) throw err;
       var regex = "";
       for (var i = 0; i < result.length; i++) {
       	if (i == result.length-1) {
       		regex += result[i].code;
       	}else{
       		regex += result[i].code+"|";
       	}
       }
       return callback(regex);
    });
};


module.exports = Lang;