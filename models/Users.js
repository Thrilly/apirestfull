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

User.authenticate = function(password, domain_id, callback){
  var sql = "SELECT * FROM user u JOIN domain d on u.id = d.user_id WHERE u.password = '"+password+"' AND d.id = "+domain_id;
    app.con.query(sql, function (err, result) {
       if (err) throw err;
       if (result.length == 0) return callback(false);
       return callback(true);
    });
};

module.exports = User;