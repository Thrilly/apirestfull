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

Translation.getTranslationsById = function(id, callback){
    var sql = "SELECT t.id, t.code "+
            "FROM translation t "+
            "WHERE t.id = '"+id+"'";
            
    app.con.query(sql, function (err, result) {
        // if (err) throw err;
        if (result.length != 0) {
            return callback(result[0]);
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

Translation.getTranslationsToLangById = function(id, callback){
    var sql = "SELECT t.id, tl.lang_id, tl.trans "+
                "FROM translation_to_lang tl "+
                "JOIN translation t "+
                "ON t.id=tl.translation_id "+
                "WHERE t.id = '"+id+"'";


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

Translation.setTranslations = function(domain_id, domain_lang, code, trans, callback){
    var sql = "INSERT INTO `translation` (`id`, `domain_id`, `code`) VALUES (NULL, '"+domain_id+"', '"+code+"');";
    
    app.con.query(sql, function (err, result) {

        if (err) return callback({error: err.sqlMessage})

        if (typeof result.insertId !== "undefined") {
            for (var key in domain_lang){
                // console.log(domain_lang[key])
                var lang_key = domain_lang[key];
                if (typeof trans[lang_key] !== "undefined") {
                    var sql2 = "INSERT INTO `translation_to_lang` (`translation_id`, `lang_id`, `trans`) VALUES ('"+result.insertId+"', '"+lang_key+"', '"+trans[lang_key]+"');";
                    app.con.query(sql2, function (err, result) {
                        if (err) return callback({error: "SQL MESSAGE : "+err.sqlMessage})
                    })
                }else{
                    // var sql2 = "INSERT INTO `translation_to_lang` (`translation_id`, `lang_id`, `trans`) VALUES ('"+result.insertId+"', '"+lang_key+"', '');";
                    // app.con.query(sql2, function (err, result) {
                        // if (err) return callback({error: "SQL MESSAGE : "+err.sqlMessage})
                    // })
                    trans[lang_key] = code;
                } 
            }

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

Translation.setTranslation = function(domain_id, domain_lang, id, trans, callback){
    
    Translation.getTranslationsToLangById(id, function(result){
        Translation.getTranslationsById(id, function(tld){

            if (!result) { return callback({error: "No translation with id "+id}) }

            var dbtrans = result[id];
            for (var trans_key in trans){

                var sql;
                if (typeof dbtrans[trans_key] === "undefined"){
                    sql = "INSERT INTO `translation_to_lang` (`translation_id`, `lang_id`, `trans`) VALUES ('"+id+"', '"+trans_key+"', '"+trans[trans_key]+"');";
                } else {
                    sql = "UPDATE `translation_to_lang` SET trans = '"+ trans[trans_key] +"' WHERE translation_id = "+ id +" AND lang_id = '"+trans_key+"';";
                }
                dbtrans[trans_key] = trans[trans_key];

                for (var key in domain_lang){
                    var lang_key = domain_lang[key];
                    if (typeof dbtrans[lang_key] === "undefined") {
                        dbtrans[lang_key] = tld.code;
                    } 
                }

                app.con.query(sql, function (err, result) {
                    if (err) return callback({error: err.sqlMessage});

                    var datas = {
                        trans: dbtrans,
                        id: parseInt(id),
                        code: tld.code,
                    }

                    return callback(datas);
                });
            }
        });
    });
};

Translation.deleteTranslations = function(id, callback){
    
    sql = "DELETE FROM translation_to_lang WHERE translation_id = '"+id+"';";

    app.con.query(sql, function (err, result) {

        sql2 = "DELETE FROM translation WHERE id = '"+id+"';";

        if (err) return callback({error: err.sqlMessage});

        app.con.query(sql2, function (err, result) {
            if (err) return callback({error: err.sqlMessage});
        });
        var datas = {
            id: parseInt(id),
        }

        return callback(datas);
    });

};

module.exports = Translation;