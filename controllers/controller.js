
const Connection = require('mysql/lib/Connection');
const db1 = require('../models/database1.js');
const db2 = require('../models/database2.js');
const db3 = require('../models/database3.js');

var isNode1Online = false;
var isNode2Online = false;
var isNode3Online = false;

// checks if node 1 is online
db1.connect(function(err) {
    if (err) {
        isNode1Online = false;
    }   
    else
    {
        isNode1Online = true;
        console.log("Node 1 Connected");
    }
});

// checks if node 2 is online
db2.connect(function(err) {
    if (err) {
        isNode2Online = false;
    }
    else 
    {
        isNode2Online = true;
        console.log("Node 2 Connected");
    }
});

// checks if node 3 is online
db3.connect(function(err) {
    if (err) {
        isNode3Online = false;
    }
    else 
    {
        isNode3Online = true;
        console.log("Node 3 Connected");
    }
});

function recover () {
    var timeId1 = 0;
    var timeId2 = 0;
    var timeId3 = 0;
    var headTimeId = 0;
    if (isNode1Online) {
        db1.query("SELECT MAX(time_id) as max_id FROM recovery_log", function (err, result1) {
            timeId1 = result1[0].max_id;
            console.log("timeID1 query: ", timeId1);
        });
    }
    if (isNode2Online) {
        db2.query("SELECT MAX(time_id) as max_id FROM recovery_log", function (err, result2) {
            timeId2 = result2[0].max_id;
            console.log("timeID2 query: ", timeId2);
        });
    }
    if (isNode3Online) {
        db3.query("SELECT MAX(time_id) as max_id FROM recovery_log", function (err, result3) {
            timeId3 = result3[0].max_id;
            console.log("timeID3 query: ", timeId3);
        });
    }

    setTimeout(function(){
        console.log("timeId1 = ", timeId1);
        console.log("timeId2 = ", timeId2);
        console.log("timeId3 = ", timeId3);

        headTimeId = timeId1;

        if (headTimeId < timeId2)
            headTimeId = timeId2;
        
        if (headTimeId < timeId3) 
            headTimeId = timeId3;
        
        if (timeId1 == null) {
            timeId1 = 0;
        }

        if (timeId2 == null) {
            timeId2 = 0;
        }

        if (timeId3 == null) {
            timeId3 = 0;
        }
        console.log("Head Time ID: ", headTimeId);

        if (timeId1 < headTimeId && isNode1Online) {
            console.log("\n ------ RECOVERING TO NODE 1 ------ \n")
            let sql = "SELECT * FROM recovery_log WHERE `time_id` > " + timeId1;
            db2.query(sql, function(err, result){
                var time_id = timeId1+1;
                for (var i = 0; i < headTimeId-timeId1; i++) {
                    console.log("\n -------- RESULT " + i + " -------- \n");
                    if (result[i].action == "DELETE"){
                        try {
                            console.log("DELETING TO RECOVER NODE 1 ---- Result " + i);
                            let sql = "DELETE FROM movies WHERE `id` = " + result[i].movie_id;
                            db1.query("START TRANSACTION", function(err, result){})
                            db1.query(sql, function(err, result){
                                if (err) throw err;
                            })
                            db1.query("COMMIT", function(err, result){});
                        } catch (err) {
                            db1.rollback();
                            console.log("Rollback Successful");
                            return 'Error in Deleting to Node1';
                        }
                        
                    }

                    else if (result[i].action == "INSERT") {
                        try {
                            console.log("INSERTING TO RECOVER NODE 1 ---- Result " + i);
                            var post = {id: result[i].movie_id, name: result[i].name, year: result[i].year, rank: result[i].rank};
                            let sql = "INSERT INTO movies SET ?";
                            db1.query("START TRANSACTION", function(err, result){});
                            db1.query(sql, post, function(err, result){
                                if (err) throw err;
                            })
                            db1.query("COMMIT", function(err, result){});
                        } catch (err) {
                            db1.rollback();
                            console.log("Rollback Successful");
                            return 'Error in Inserting to Node1';
                        }
                    }

                    else if (result[i].action == "EDIT") {
                        try {
                            console.log("EDITING TO RECOVER NODE 1 ---- Result " + i);
                            let sql = "UPDATE movies SET `name`='" + result[i].name + "', `year`=" + result[i].year + ", `rank`=" + result[i].rank + " WHERE `id` = " + result[i].movie_id + ";";
                            db1.query("START TRANSACTION", function(err, result){});
                            db1.query(sql, function(err, result){
                                if (err) throw err;
                            })
                            db1.query("COMMIT", function(err, result){});
                        } catch (err) {
                            db1.rollback();
                            console.log("Rollback Successful");
                            return 'Error in Updating to Node1';
                        }
                    }
                    if (isNode1Online) {
                        try {
                            console.log("\n---- INSERTING TO RECOVERY NODE 1 ----\n");
                            let sql = "INSERT INTO recovery_log SET ?";
                            var post = {time_id: time_id, movie_id: result[i].movie_id, name: result[i].name, year: result[i].year, rank: result[i].rank, action: result[i].action};
                            db1.query("START TRANSACTION", function(err, result){});
                            db1.query(sql, post, function(err, result){
                            if (err) throw err;
                            })
                             db1.query("COMMIT", function(err, result){ console.log(" \n\n\n I WAS HERE \n\n\n")});
                        } catch (err) {
                            db1.rollback();
                            console.log("Rollback Successful");
                            return 'Error in Inserting to Recovery Node1';                
                        }   
                    }

                    time_id++;

                }
                
            });
        }
        // NODE 2
        else if (timeId2 < headTimeId && isNode2Online) {
            console.log("\n ------ RECOVERING TO NODE 2 ------ \n")
            let sql = "SELECT * FROM recovery_log WHERE `time_id` > " + timeId2;
            db1.query(sql, function(err, result){
                var time_id = timeId2+1;
                for (var i = 0; i < headTimeId-timeId2; i++) {
                    console.log("\n -------- RESULT " + i + " -------- \n");
                    if (result[i].action == "DELETE"){
                        try {
                            console.log("DELETING TO RECOVER NODE 2 ---- Result " + i);
                            let sql = "DELETE FROM movies WHERE `id` = " + result[i].movie_id;
                            db2.query("START TRANSACTION", function(err, result){})
                            db2.query(sql, function(err, result){
                                if (err) throw err;
                            })
                            db2.query("COMMIT", function(err, result){});
                        } catch (err) {
                            db2.rollback();
                            console.log("Rollback Successful");
                            return 'Error in Deleting to Node2';
                        }
                    }

                    else if (result[i].action == "INSERT") {
                        try {
                            console.log("INSERTING TO RECOVER NODE 2 ---- Result " + i);
                            var post = {id: result[i].movie_id, name: result[i].name, year: result[i].year, rank: result[i].rank};
                            let sql = "INSERT INTO movies SET ?";
                            db2.query("START TRANSACTION", function(err, result){});
                            db2.query(sql, post, function(err, result){
                                if (err) throw err;
                            })
                            db2.query("COMMIT", function(err, result){});
                        } catch (err) {
                            db2.rollback();
                            console.log("Rollback Successful");
                            return 'Error in Inserting to Node2';
                        }
                    }

                    else if (result[i].action == "EDIT") {
                        if(result[i].year < 1980) {
                            try {
                                console.log("EDITING TO RECOVER NODE 2 ---- Result " + i);
                                let sql = "UPDATE movies SET `name`='" + result[i].name + "', `year`=" + result[i].year + ", `rank`=" + result[i].rank + " WHERE `id` = " + result[i].movie_id + ";";
                                db2.query("START TRANSACTION", function(err, result){});
                                db2.query(sql, function(err, result){
                                    if (err) throw err;
                                })
                                db2.query("COMMIT", function(err, result){});
                            } catch (err) {
                                db2.rollback();
                                console.log("Rollback Successful");
                                return 'Error in Updating to Node2';
                            }
                        }
                        else if (result[i].year >= 1980) {
                            try {
                                console.log("DELETING TO RECOVER NODE 2 ---- Result " + i);
                                let sql = "DELETE FROM movies WHERE `id` = " + result[i].movie_id;
                                db2.query("START TRANSACTION", function(err, result){})
                                db2.query(sql, function(err, result){
                                    if (err) throw err;
                                })
                                db2.query("COMMIT", function(err, result){});
                            } catch (err) {
                                db2.rollback();
                                console.log("Rollback Successful");
                                return 'Error in Deleting to Node2';
                            }
                            try {
                                console.log("INSERTING TO RECOVER NODE 3 ---- Result " + i);
                                var post = {id: result[i].movie_id, name: result[i].name, year: result[i].year, rank: result[i].rank};
                                let sql = "INSERT INTO movies SET ?";
                                db3.query("START TRANSACTION", function(err, result){});
                                db3.query(sql, post, function(err, result){
                                    if (err) throw err;
                                })
                                db3.query("COMMIT", function(err, result){});
                            } catch (err) {
                                db3.rollback();
                                console.log("Rollback Successful");
                                return 'Error in Inserting to Node3';
                            }
                        }
                        
                    }
                    if (isNode2Online) {
                        try {
                            console.log("\n---- INSERTING TO RECOVERY NODE 2 ----\n");
                            let sql = "INSERT INTO recovery_log SET ?";
                            var post = {time_id: time_id, movie_id: result[i].movie_id, name: result[i].name, year: result[i].year, rank: result[i].rank, action: result[i].action};
                            db2.query("START TRANSACTION", function(err, result){});
                            db2.query(sql, post, function(err, result){
                            if (err) throw err;
                            })
                             db2.query("COMMIT", function(err, result){});
                        } catch (err) {
                            db2.rollback();
                            console.log("Rollback Successful");
                            return 'Error in Inserting to Recovery Node2';                
                        }   
                    }

                    time_id++;
                }
            });
        }

        // NODE 3
        else if (timeId3 < headTimeId && isNode3Online) {
            console.log("\n ------ RECOVERING TO NODE 3 ------ \n")
            let sql = "SELECT * FROM recovery_log WHERE `time_id` > " + timeId3;
            db1.query(sql, function(err, result){
                var time_id = timeId3+1;
                for (var i = 0; i < headTimeId-timeId3; i++) {
                    console.log("\n -------- RESULT " + i + " -------- \n");
                    if (result[i].year >= 1980) {
                        if (result[i].action == "DELETE"){
                            try {
                                console.log("DELETING TO RECOVER NODE 3 ---- Result " + i);
                                let sql = "DELETE FROM movies WHERE `id` = " + result[i].movie_id;
                                db3.query("START TRANSACTION", function(err, result){})
                                db3.query(sql, function(err, result){
                                    if (err) throw err;
                                })
                                db3.query("COMMIT", function(err, result){});
                            } catch (err) {
                                db3.rollback();
                                console.log("Rollback Successful");
                                return 'Error in Deleting to Node3';
                            }
                            
                        }
    
                        else if (result[i].action == "INSERT") {
                            try {
                                console.log("INSERTING TO RECOVER NODE 3 ---- Result " + i);
                                var post = {id: result[i].movie_id, name: result[i].name, year: result[i].year, rank: result[i].rank};
                                let sql = "INSERT INTO movies SET ?";
                                db3.query("START TRANSACTION", function(err, result){});
                                db3.query(sql, post, function(err, result){
                                    if (err) throw err;
                                })
                                db3.query("COMMIT", function(err, result){});
                            } catch (err) {
                                db3.rollback();
                                console.log("Rollback Successful");
                                return 'Error in Inserting to Node3';
                            }
                        }
                    }
                    

                    if (result[i].action == "EDIT") {
                        if (result[i].year >= 1980) {
                            try {
                                console.log("EDITING TO RECOVER NODE 3 ---- Result " + i);
                                let sql = "UPDATE movies SET `name`='" + result[i].name + "', `year`=" + result[i].year + ", `rank`=" + result[i].rank + " WHERE `id` = " + result[i].movie_id + ";";
                                db3.query("START TRANSACTION", function(err, result){});
                                db3.query(sql, function(err, result){
                                    if (err) throw err;
                                })
                                db3.query("COMMIT", function(err, result){});
                            } catch (err) {
                                db3.rollback();
                                console.log("Rollback Successful");
                                return 'Error in Updating to Node3';
                            }
                        }
                        else if (result[i].year < 1980) {
                            try {
                                console.log("DELETING TO RECOVER NODE 3 ---- Result " + i);
                                let sql = "DELETE FROM movies WHERE `id` = " + result[i].movie_id;
                                db3.query("START TRANSACTION", function(err, result){})
                                db3.query(sql, function(err, result){
                                    if (err) throw err;
                                })
                                db3.query("COMMIT", function(err, result){});
                            } catch (err) {
                                db3.rollback();
                                console.log("Rollback Successful");
                                return 'Error in Deleting to Node3';
                            }
                            try {
                                console.log("INSERTING TO RECOVER NODE 2 ---- Result " + i);
                                var post = {id: result[i].movie_id, name: result[i].name, year: result[i].year, rank: result[i].rank};
                                let sql = "INSERT INTO movies SET ?";
                                db2.query("START TRANSACTION", function(err, result){});
                                db2.query(sql, post, function(err, result){
                                    if (err) throw err;
                                })
                                db2.query("COMMIT", function(err, result){});
                            } catch (err) {
                                db2.rollback();
                                console.log("Rollback Successful");
                                return 'Error in Inserting to Node2';
                            }
                        }
                        
                    }

                    if (isNode3Online) {
                        try {
                            console.log("\n---- INSERTING TO RECOVERY NODE 3 ----\n");
                            let sql = "INSERT INTO recovery_log SET ?";
                            var post = {time_id: time_id, movie_id: result[i].movie_id, name: result[i].name, year: result[i].year, rank: result[i].rank, action: result[i].action};
                            db3.query("START TRANSACTION", function(err, result){});
                            db3.query(sql, post, function(err, result){
                            if (err) throw err;
                            })
                             db3.query("COMMIT", function(err, result){});
                        } catch (err) {
                            db3.rollback();
                            console.log("Rollback Successful");
                            return 'Error in Inserting to Recovery Node3';                
                        }   
                    }

                    time_id++;
                }

            });
        }
    }, 2000);

}

function insertToRecover(id, name, year, rank, action) {
    var timeId1 = 0;
    var timeId2 = 0;
    var timeId3 = 0;
    var headTimeId = 0;

    if (isNode1Online) {
        try {
            let sql = "SELECT MAX(time_id) as max_id FROM recovery_log";
            console.log("QUERY TO NODE 1: ", sql);
            db1.query("START TRANSACTION", function(err){});
            db1.query(sql , function (err, result1) {
                timeId1 = result1[0].max_id;
                console.log("Went to DB1");
            });
            db1.query("COMMIT");
        } catch (err) {
            db1.rollback();
            console.log("Rollback Successful");
            return 'Error Getting Max Id to Node 1';
        }
        
    }
    if (isNode2Online) {
        try {
            let sql2 = "SELECT MAX(time_id) as max_id FROM recovery_log";
            console.log("QUERY TO NODE 2: ", sql2);
            db2.query("START TRANSACTION", function(err){});
            db2.query(sql2, function (err, result2) {
                timeId2 = result2[0].max_id;
                console.log("Went to DB2");
            });
            db2.query("COMMIT", function(err){});
        } catch (err) {
            db2.rollback();
            console.log("Rollback Successful");
            return 'Error Getting Max Id of Node 2';
        }
        
    }
    if (isNode3Online) {
        try {
            let sql3 = "SELECT MAX(time_id) as max_id FROM recovery_log"
            console.log("QUERY TO NODE 3: ", sql3);
            db3.query("START TRANSACTION", function(err){});
            db3.query(sql3, function (err, result3) {
                timeId3 = result3[0].max_id;
                console.log("Went to DB3");
            });
            db3.query("COMMIT", function(err){});
        } catch (err) {
            db3.rollback();
            console.log("Rollback Sucessful");
            return 'Error Getting Max Id of Node 3';
        }
        
    }

    setTimeout(function(){
        if (timeId1 == null) {
            timeId1 = 0;
        }

        if (timeId2 == null) {
            timeId2 = 0;
        }

        if (timeId3 == null) {
            timeId3 = 0;
        }

        console.log("timeId1 = ", timeId1);
        console.log("timeId2 = ", timeId2);
        console.log("timeId3 = ", timeId3);

        headTimeId = timeId1;

        if (headTimeId < timeId2)
            headTimeId = timeId2;
        
        if (headTimeId < timeId3) 
            headTimeId = timeId3

        console.log("Head Time ID: ", headTimeId);
        var post = {time_id: headTimeId + 1, movie_id: id, name: name, year: year, rank: rank, action: action}
        console.log("time_id = ", post.time_id);
        console.log("movie_id = ", post.movie_id);
        console.log("name = ", post.name);
        console.log("year = ", post.year);
        console.log("rank = ", post.rank);
        console.log("action = ", post.action);
        console.log("GOING TO INSERT ACTION");
        if (isNode1Online) {
            try {
                console.log("\n---- INSERTING TO RECOVERY NODE 1 ----\n");
                let sql = "INSERT INTO recovery_log SET ?";
                db1.query("START TRANSACTION", function(err, result){});
                db1.query(sql, post, function(err, result){
                if (err) throw err;
                })
                 db1.query("COMMIT", function(err, result){});
            } catch (err) {
                db1.rollback();
                console.log("Rollback Successful");
                return 'Error in Inserting to Recovery Node1';                
            }   
        }
        if (isNode2Online) {
            try {
                console.log("\n---- INSERTING TO RECOVERY NODE 2 ----\n");
                let sql = "INSERT INTO recovery_log SET ?";
                db2.query("START TRANSACTION", function(err, result){});
                db2.query(sql, post, function(err, result){
                    if (err) throw err;
                })
                db2.query("COMMIT", function(err, result){});
            } catch (err) {
                db2.rollback();
                console.log("Rollback Successful");
                return 'Error in Inserting to Recovery Node2';
            }
        }
        if (isNode3Online) {
            try {
                console.log("\n---- INSERTING TO RECOVERY NODE 3 ----\n");
                let sql = "INSERT INTO recovery_log SET ?";
                db3.query("START TRANSACTION", function(err, result){});
                db3.query(sql, post, function(err, result){
                    if (err) throw err;
                })
                db3.query("COMMIT", function(err, result){});
            } catch (err) {
                db3.rollback();
                console.log("Rollback Successful");
                return 'Error in Inserting to Recovery Node3';
            }
        }
    }, 2000);
}

const controller = {
    getIndex: function (req, res) {
        // SELECT ALL
        const limit = 20;
        recover ();
        let page = req.query.page ? Number(req.query.page) : 1;
        let sql = "SELECT COUNT(*) as count FROM movies";
        setTimeout(function(){
            if (isNode1Online) {
                db1.query(sql, function(err, results) {
                    if(err) throw err;
                    const numOfResults = results[0].count;
                    const numberOfPages = Math.ceil(numOfResults/limit);
                    page = req.query.page ? Number(req.query.page) : 1;
                    if (page > numberOfPages) {
                        res.redirect('/?page='+encodeURIComponent(numberOfPages));
                    } else if (page < 1) {
                        res.redirect('/?page='+encodeURIComponent(1));
                    }
                    
                    // Determine the SQL Limit starting number
                    const startingLimit = (page - 1) * limit;
                    sql = `SELECT * FROM movies ORDER BY id DESC LIMIT ${startingLimit}, ` + limit;
                    db1.query(sql, function(err, results){
                        if (err) throw err;
                        let iterator = (page - 5) < 1 ? 1 : page - 5;
                        let endingLink = (iterator + 9) <= numberOfPages ? (iterator + 9) : page + (numberOfPages - page);
                        console.log(page, ", ", iterator, ", ", endingLink, ", ");
                        if(endingLink < (page + 4)) {
                            iterator -= (page + 4) - numberOfPages;
                        }
                        var currentPage = page;
                        console.log("page count: ", numberOfPages, " Current Page: ", currentPage);
                            res.render('index', {movies: results, currentPage: currentPage, pageCount: numberOfPages, size: 5});
                    });
                });
            }
            else {
                let sql = "SELECT * FROM movies ORDER BY id DESC LIMIT 20";
                var results = [];
                db2.query(sql, function(err, result1) {
                    results = results.concat(result1);
                    db3.query(sql, function(err, result2) {
                        results = results.concat(result2);
                        results.sort((a,b) => {
                            if(a.id < b.id) return 1;
                            else if (a.id == b.id) return 0;
                            else if (a.id >= b.id) return -1;
                        });
                            res.render('index', {movies: results});
                    })
                });
            }
        }, 1000);
        
        

    },
    getEdit: function (req, res) {
        var id = req.params.id;
        var year = req.params.id;
        var sqlSelect = "SELECT * FROM movies WHERE `id` = " + id;
        if (isNode1Online) {
            db1.query("START TRANSACTION", function (err, result) {
            });
            db1.query(sqlSelect, (err, result) => {
                if (err) throw err;
                console.log(result);
                res.render('edit-movie', {name: result[0].name, year: result[0].year, rank: result[0].rank, id: id})
            });
            db1.query("COMMIT", function (err, result) {
            });
            db1.query("DO SLEEP(2)", function (err, result) {
            });
        }
        
        else if (year < 1980) {
            db2.query("START TRANSACTION", function (err, result) {
            });
            db2.query(sqlSelect, (err, result) => {
                if (err) throw err;
                console.log(result);
                res.render('edit-movie', {name: result[0].name, year: result[0].year, rank: result[0].rank, id: id})
            });
            db2.query("COMMIT", function (err, result) {
            });
            db2.query("DO SLEEP(2)", function (err, result) {
            });
        }
        
        else if (year >= 1980) {
            db3.query("START TRANSACTION", function (err, result) {
            });
            db3.query(sqlSelect, (err, result) => {
                if (err) throw err;
                console.log(result);
                res.render('edit-movie', {name: result[0].name, year: result[0].year, rank: result[0].rank, id: id})
            });
            db3.query("COMMIT", function (err, result) {
            });
            db3.query("DO SLEEP(2)", function (err, result) {
            });
        }
        
    },
    getAdd: function (req, res) {
        res.render('add-movie');
    },
    postAdd: async function (req, res) {
        recover ()
        console.log("\n ------- ADDING ------- \n")
        var max_row = 0;
        var sql = "SELECT MAX(id) AS max_row FROM movies";
        var sqlInsert = "INSERT INTO movies SET ?";
        var post = {};
        // first finds the highest id
        console.log("name " + req.body.name);
        console.log("year " + req.body.year);
        console.log("rank " + req.body.rank);

        // node 1
        if (isNode1Online) {
            db1.beginTransaction(function(err) {
                if (err) {}
                db1.query(sql, function(err, results) {
                    if(err) {
                        return db1.rollback();
                    }
                    // increments the id of the highest id since autoincrement isn't possible
                    max_row = results[0].max_row
                    console.log(max_row);
                    db2.query("SELECT MAX(id) AS max_row FROM movies", function(err, result2) {
                        if(err) {
                            return db1.rollback();
                        }
                        if (max_row < result2[0].max_row)
                            max_row = result2[0].max_row;
                        db3.query("SELECT MAX(id) AS max_row FROM movies", function(err, result3) {
                            if(err) {
                                return db1.rollback()
                            }
                            if (max_row < result3[0].max_row)
                                max_row = result3[0].max_row;
                            
                        });
                    });
    
                    setTimeout(function() {
                        max_row++;
                            post = {id: max_row, name: req.body.name, year: req.body.year, rank: req.body.rank};
                            db1.query(sqlInsert, post, (err, result) => {
                                if (err) {
                                    return db1.rollback();
                                }
                                console.log(result);
                                db1.query("DO SLEEP(10)", function(err){
                                    if (err) {
                                        return db1.rollback();
                                    }
                                    db1.commit(function(err){
                                        if (err) {
                                            return db1.rollback();
                                        }
                                    })
                                });
                            });
                    }, 500);
                });
            })
            
        }
        setTimeout( function() {
            // for checking if max_id is still seen
            console.log("Max Id1: " + max_row);
            if(!isNode1Online) {
                console.log("Node 1 is Offline");
                db2.query("START TRANSACTION", function(err){});
                db2.query("SELECT MAX(id) AS max_row2 FROM movies", function(err, results) {
                    if (err) { 
                        console.log("Error db2");
                        throw err
                    }
                    max_row = results[0].max_row2;
                    db3.query("START TRANSACTION", function(err){});
                    db3.query("SELECT MAX(id) AS max_row3 FROM movies", function(err, results) {
                        if (err) { 
                            console.log("Error db3");
                            throw err
                        }
                        if (results[0].max_row3 > max_row) {
                            max_row = results[0].max_row3;
                        
                        console.log("Max Id3: ", max_row);
                            
                        max_row++;
                        post = {id: max_row, name: req.body.name, year: req.body.year, rank: req.body.rank};
                        }
                    });
                    db3.query("COMMIT", function(err){});
                });
                db2.query("COMMIT", function(err){});
            }
            
            // node 2
            setTimeout( function () {
                console.log("Max Id2: " + max_row);
                if (req.body.year < 1980 && isNode2Online) {
                    console.log("post: " + post);
                    try {
                        db2.query("START TRANSACTION", function (err, result) {
                        });
                        db2.query(sqlInsert, post, (err, result) => {
                            if (err) throw err;
                            console.log(result);
                        });
                        db2.query("COMMIT", function (err, result) {
                        });
                    } catch (err) {
                        db2.rollback();
                        console.log("Rollback successful");
                        return 'Error Inserting to Node2';
                    }
                    
                }
    
                // node 3
                else if (req.body.year >= 1980 && isNode3Online) {
                    try {
                        console.log("post: " + post);
                        db3.query("START TRANSACTION", function (err, result) {
                        });
                        db3.query(sqlInsert, post, function (err, result) {
                            if (err) throw err;
                            console.log(result);
                        });
                        db3.query("COMMIT", function (err, result) {
                            if (err) throw err;
                        });
                    } catch (err) {
                        db3.rollback();
                        console.log("Rollback successful");
                        return 'Error Inserting to Node3';
                    }
                }
                console.log("max_row = ", max_row);
                console.log("name = ", post.name);
                console.log("year = ", post.year);
                console.log("rank = ", post.rank);
                insertToRecover(max_row, post.name, post.year, post.rank, "INSERT");
                
                
            }, 500);
            
        }, 500);
        
        setTimeout(function(){
            res.redirect('/');
        }, 2000);
    },
    postEdit: async function (req, res) {
        recover ();
        console.log("\n ------- UPDATING ------- \n")
        var userId = req.body.id;
        var oldYear = req.body.oldYear;
        console.log("id: " + userId);
        var sqlUpdate = "UPDATE movies SET `name`='" + req.body.name + "', `year`=" + req.body.year + ", `rank`=" + req.body.rank + " WHERE `id` = " + userId + ";"
        
        // node 1
        if (isNode1Online){
            db1.beginTransaction(function(err) {
                if (err) {}
                console.log("Updating Node 1");
                db1.query(sqlUpdate, (err, result) => {
                    if (err) {
                        return db1.rollback();
                    }
                    console.log(result);

                    db1.commit(function(err) {
                        if (err) {
                            db1.rollback();
                        }
                    });
                });
            })
            
            
        }
        
        setTimeout(function() {
            // node 2
            if (oldYear < 1980 && isNode2Online){
                if (req.body.year < 1980) {
                    try {
                        console.log("Updating Node 2");
                        db2.query("START TRANSACTION", function (err) {
                        });
                        db2.query(sqlUpdate, (err, result) => {
                            if (err) throw err;
                            console.log(result);
                        });
                        db2.query("COMMIT", function(err) {
                        });
                    } catch (err) {
                        db2.rollback();
                        console.log("Rollback Successful");
                        return 'Error in Updating to Node2';
                    }
                    
                }
                else if (req.body.year >= 1980) {
                    try {
                        var sqlDelete = "DELETE FROM movies WHERE `id` = " + userId + ";"
                        console.log("Deleting to Node 2");
                        db2.query("START TRANSACTION", function (err) {
                        });
                        db2.query(sqlDelete, (err, result) => {
                            if (err) throw err;
                            console.log("Query Deleted");
                        });  
                        db2.query("COMMIT", function(err){
                        });
                    } catch (err) {
                        db2.rollback();
                        console.log("Rollback Successful");
                        return 'Error in Deleting to Node2'
                    }
                    
                    
                    if (isNode3Online) {
                        try {
                            console.log("Inserting to Node 3")
                            const post = {id: userId, name: req.body.name, year: req.body.year, rank: req.body.rank};
                            sqlInsert = "INSERT INTO movies SET ?"
                            db3.query("START TRANSACTION", function(err){});
                            db3.query(sqlInsert, post, (err, result) => {
                                if (err) throw err;
                                console.log(result);
                            });
                            db3.query("COMMIT", function(err) {});
                        } catch (err) {
                            db3.rollback();
                            console.log("Rollback Successful");
                            return 'Error in Inserting to Node3';
                        }
                    }
                }
            }

            // node 3
            else if (oldYear >= 1980 && isNode3Online){
                if (req.body.year >= 1980) {
                    try {
                        console.log("Updating Node 3");
                        db3.query("START TRANSACTION", function(err){});
                        db3.query(sqlUpdate, (err, result) => {
                            if (err) throw err;
                            console.log(result);
                        });
                        db3.query("COMMIT", function(err) {});
                    } catch (err) {
                        db3.rollback();
                        console.log("Rollback Successful");
                        return 'Error Updating to Node3'
                    }
                    
                }
                else if (req.body.year < 1980) {
                    try {
                        var sqlDelete = "DELETE FROM movies WHERE `id` = " + userId + ";"
                        console.log("Deleting to Node 3");
                        db3.query("START TRANSACTION", function(err){});
                        db3.query( sqlDelete, (err, result) => {
                            if (err) throw err;
                            console.log("Query Deleted");
                        });                        
                        db3.query("COMMIT", function(err){});
                    } catch (err) {
                        db3.rollback();
                        console.log("Rollback Successful");
                        return 'Error Deleting to Node3';
                    }
                      

                    if (isNode2Online) {
                        try {
                            console.log("Inserting to Node 2");
                            const post = {id: userId, name: req.body.name, year: req.body.year, rank: req.body.rank};
                            sqlInsert = "INSERT INTO movies SET ?";
                            db2.query("START TRANSACTION", function(err) {});
                            db2.query(sqlInsert, post, (err, result) => {
                                if (err) throw err;
                                console.log(result);
                            });
                            db2.query("COMMIT", function(err){});
                        } catch (err) {
                            db2.rollback();
                            console.log("Rollback Successful");
                            return 'Error Inserting to Node2';
                        }
                        
                    }
                }
                
            }
            console.log("id = ", userId);
            console.log("name = ", req.body.name);
            console.log("year = ", req.body.year);
            console.log("rank = ", req.body.rank);
            insertToRecover(userId, req.body.name, req.body.year, req.body.rank, "EDIT");            
            res.redirect('/');
        }, 500);
        

    },
    postDelete: async function (req, res) {
        recover ();
        console.log("\n ------- DELETING ------- \n")
        var id = req.params.id;
        var year = req.params.year;
        var name = req.params.name;
        var rank = req.params.rank;

        console.log("year: " + year);
        var sqlDelete = "DELETE FROM movies WHERE `id` = " + id + ";"

        // node 1
        if (isNode1Online)
        {
            db1.beginTransaction(function(err){
                if(err) {}
                console.log("Deleting to Node 1");
                db1.query( sqlDelete, (err, result) => {
                    if (err) {
                        return db1.rollback();
                    }
                    console.log("Query Deleted");

                    db1.commit(function(err){
                        if (err) {
                            return db1.rollback();
                        }
                    });
                });
            });
        }

        setTimeout(function() {
            // node 2
            if (year < 1980 && isNode2Online) {
                try {
                    console.log("Deleting to Node 2");
                    db2.query("START TRANSACTION", function(){});
                    db2.query(sqlDelete, (err, result) => {
                        if (err) throw err;
                        console.log("Query Deleted");
                    });  
                    db2.query("COMMIT", function(){});
                } catch (err) {
                    db2.rollback();
                    console.log("Rollback Successful");
                    return 'Error in Deleting Node2';
                }
            }
            // node 3
            else if (year >= 1980 && isNode3Online){
                try {
                    console.log("Deleting to Node 3");
                    db3.query("START TRANSACTION", function(err){});
                    db3.query( sqlDelete, (err, result) => {
                        if (err) throw err;
                        console.log("Query Deleted");
                    });  
                    db3.query("COMMIT", function(err){});
                } catch (err) {
                    db3.rollback();
                    console.log("Rollback Successful");
                    return 'Error in Deleting Node3';
                }
            }
            console.log("id = ", id);
            console.log("name = ", name);
            console.log("year = ", year);
            console.log("rank = ", rank);
            insertToRecover(id, name, year, rank, "DELETE");  
            res.redirect('/');
        }, 500);
    }
}

module.exports = controller;