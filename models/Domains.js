var app = require("../config/config");

function Domain() {}

Domain.getDomains = function(callback){
	var sql = "SELECT id, slug, name, description FROM domain";
    app.con.query(sql, function (err, result) {
       if (err) throw err;
       return callback(result);
    });
};

Domain.getDomain = function(dname, callback){
	var sql = "SELECT * FROM domain where name = '"+dname+"'";
    app.con.query(sql, function (err, result) {
       	// if (err) throw err;
       	if (result.length != 0) {
       		return callback(result[0]);
       	}else{
       		return callback(false);
       	}
    });
};

Domain.getDomainLangs = function(did, callback){
  var sql = "SELECT lang_id FROM domain_lang where domain_id = "+did+"";
    app.con.query(sql, function (err, result) {
       var resp = [];
       for (var i = 0; i < result.length; i++) {
         resp.push(result[i].lang_id)
       }
       // console.log(resp);
       if (err) throw err;
       return callback(resp);
    });
};

module.exports = Domain;