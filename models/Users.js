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
	var sql = "SELECT id, username, email FROM user where id = '"+id+"'";
    app.con.query(sql, function (err, result) {
       if (err) throw err;
       return callback(result[0]);
    });
};

User.authenticate = function(password, domain_id, callback){
  var sql = "SELECT d.id FROM user u JOIN domain d on u.id = d.user_id WHERE u.password = '"+password+"'";
    app.con.query(sql, function (err, result) {
       if (err) throw err;
       if (result.length == 0) return callback(false);
       for (var k in result){
        if (result[k].id == domain_id){
          return callback(result[k].id);
        }
       }
       return callback(0);
    });
};

User.authenticateO = function(password, callback){
  var sql = "SELECT * FROM user WHERE password = '"+password+"'";
    app.con.query(sql, function (err, result) {
       if (err) throw err;
       if (result.length == 0) return callback(false);
       return callback(result[0]);
    });
};

module.exports = User;