var app = require("../config/config");

function Lang() {}

Lang.getLangs = function(callback){
	var sql = "SELECT code FROM lang";
    app.con.query(sql, function (err, result) {
       if (err) throw err;
       return callback(result);
    });
};

Lang.getLangsLimit = function(page, limit, order, callback){
  var start = (page-1)*limit;
  var sql = "SELECT code FROM lang ORDER BY code "+order+" LIMIT "+start+","+limit;
    app.con.query(sql, function (err, result) {
       if (err) throw err;
       var langs = [];
       for (var i = 0; i < result.length; i++) {
          langs.push(result[i].code);
       }
       if (langs.length > 0) { return callback(langs); }
       return callback([]);      
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

Lang.getRegexDomainLangs = function(d_id, callback){
  var sql = "SELECT lang_id FROM domain_lang WHERE domain_id =" + d_id;
    app.con.query(sql, function (err, result) {
       if (err) throw err;
       var regex = "";
       for (var i = 0; i < result.length; i++) {
        if (i == result.length-1) {
          regex += result[i].lang_id;
        }else{
          regex += result[i].lang_id+"|";
        }
       }
       return callback(regex);
    });
};

Lang.getDomainLangs = function(d_id, callback){
  var sql = "SELECT lang_id FROM domain_lang WHERE domain_id =" + d_id;
    app.con.query(sql, function (err, result) {
       if (err) throw err;
       var langs = [];
       for (var i = 0; i < result.length; i++) {
          langs.push(result[i].lang_id);
       }
       if (langs.length > 0) { return callback(langs); }
       return callback(false);      
    });
};

Lang.getDomainLangById = function(d_id, id_lang, callback){
  var sql = "SELECT lang_id FROM domain_lang WHERE domain_id =" + d_id + " AND lang_id = '"+id_lang+"'";
    app.con.query(sql, function (err, result) {
       if (err) throw err;
       if (result.length > 0) { return callback(result[0]); }
       return callback(false);      
    });
};

Lang.deleteLang = function(id_lang, callback){
  var sql = "DELETE FROM domain_lang WHERE lang_id = '"+id_lang+"'";
    app.con.query(sql, function (err, result) {
       if (err) return callback({error: err.errorMessage});
       return callback(true);      
    });
};



module.exports = Lang;