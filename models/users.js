var app = require("../config/config");

function User() {
}

User.getUsers = function(callback){
	var sql = "SELECT * FROM user";
    app.con.query(sql, function (err, result) {
       if (err) throw err;
       return callback(result);
    });
};

User.getUser = function(id, callback){
	var sql = "SELECT id, username FROM user where id = '"+id+"'";
    app.con.query(sql, function (err, result) {
       if (err) throw err;
       return callback(result[0]);
    });
};

module.exports = User;