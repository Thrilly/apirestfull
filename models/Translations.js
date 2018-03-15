var app = require("../config/config");

function Translation() {}

Translation.getTranslationsByDomain = function(domain_id, callback){
    var sql = "SELECT t.id, t.code "+
            "FROM translation t "+
            "WHERE domain_id = '"+domain_id+"'";
            
    app.con.query(sql, function (err, result) {
        // if (err) throw err;
        if (result.length != 0) {
            return callback(result);
        }else{
            return callback(false);
        }
    });
};

Translation.getTranslationsToLangByDomain = function(domain_id, callback){
    var sql = "SELECT t.id, tl.lang_id, tl.trans "+
                "FROM translation_to_lang tl "+
                "JOIN translation t "+
                "ON t.id=tl.translation_id "+
                "WHERE t.domain_id = '"+domain_id+"'";

    app.con.query(sql, function (err, result) {
        // if (err) throw err;
        if (result.length != 0) {
            var resp = {};
            for (var i = 0; i < result.length; i++) {
                if (!resp[result[i].id]) {
                    resp[result[i].id] = {};
                }
                if (!resp[result[i].id][result[i].lang_id]) {
                    resp[result[i].id][result[i].lang_id] = {};
                }
                resp[result[i].id][result[i].lang_id] = result[i].trans;
                
            }
            return callback(resp);
        }else{
            return callback(false);
        }
    });
};

module.exports = Translation;