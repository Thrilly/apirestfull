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
            return callback([]);
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

Translation.setTranslations = function(domain_id, code, trans, callback){
    var sql = "INSERT INTO `translation` (`id`, `domain_id`, `code`) VALUES (NULL, '"+domain_id+"', '"+code+"');";
    
    app.con.query(sql, function (err, result) {

        if (err) return callback({error: err.sqlMessage})

        if (typeof result.insertId !== "undefined") {
            for (var key in trans){
                var sql2 = "INSERT INTO `translation_to_lang` (`translation_id`, `lang_id`, `trans`) VALUES ('"+result.insertId+"', '"+key+"', '"+trans[key]+"');";
                app.con.query(sql2, function (err, result) {
                    if (err) return callback({error: err.sqlMessage})
                })
            }

            trans["PL"] = code;
            var datas = {
                trans: trans,
                id: result.insertId,
                code: code,
            }

            return callback(datas);
        }else{
            return callback(false);
        }
    });
};

module.exports = Translation;