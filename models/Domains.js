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
	var sql = "SELECT * FROM domain where slug = '"+dname+"'";
    app.con.query(sql, function (err, result) {
       	// if (err) throw err;
       	if (result.length != 0) {
       		return callback(result[0]);
       	}else{
       		return callback(false);
       	}
       });
};

Domain.setDomain = function(dname, desc, langs, user, callback){



    var datetime = app.datetime;
    var dt = datetime.create();
    datenow = dt.format('Y-m-d H:M:S');
    slug = dname+"_"+dt.now();

    var sql = "INSERT INTO domain VALUES (NULL, "+user.id+", '"+dname+"', '"+desc+"', '"+slug+"', '"+datenow+"');";

    app.con.query(sql, function (err, result) {

        if (err) return callback({error: "SQL MESSAGE : "+err.sqlMessage})

        for (var k in langs) {
            var sql2 = "INSERT INTO domain_lang VALUES ("+result.insertId+", '"+langs[k]+"')";
            app.con.query(sql2, function (err, result2) {
                if (err) return callback({error: "SQL MESSAGE : "+err.sqlMessage})
            });
        }

        if (result.length != 0) {
            var datas = {
                langs : langs,
                id : result.insertId,
                slug : slug,
                name : dname,
                description : desc,
                creator : {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                },
                created_at : datenow,
            }
            return callback(datas);
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
        if (err) throw err;
        return callback(resp);
    });
};

module.exports = Domain;