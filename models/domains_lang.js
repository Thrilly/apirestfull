var app = require("../config/config");

function DomainLang() {
}

DomainLang.getDomainLangs = function(did, callback){
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

module.exports = DomainLang;