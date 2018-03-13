var app = require("../config/config");

function Domain() {
}

Domain.getDomains = function(callback){
	var sql = "SELECT id, slug, name, description FROM domain";
    app.con.query(sql, function (err, result) {
       if (err) throw err;
       return callback(result);
    });
};

module.exports = Domain;