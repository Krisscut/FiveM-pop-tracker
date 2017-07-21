/**
 * Created by STE14179 on 11/07/2017.
 */

var express = require('express');
var router = express.Router();
var logger = require('../server/logger');

var model = require('../server/model');

/* GET all the server (without date and number info) . */
// http://localhost:3000/api/servers
router.get('/', function(req, res, next) {
    //model.ServerInfo.find("name ip map gameType").exec(function(err, serverInfos) {
    model.ServerInfo.find("name ip map gameType").distinct("ip").exec(function(err, serverInfos) {

    /*model.ServerInfo.aggregate(
        [
            {   // SELECT
                $project : { "ip" : 1,
                    "name":1,
                    "gameType":1,
                    "map":1
                }
            },
                // Grouping pipeline
            {
                "$group": {
                    "_id": '$ip',
                    "num_entries": {"$sum": 1},
                    "info" : { $push: "$$ROOT" }
                }
            }
        ]
    , function(err, serverInfos) {*/

            // Result is an array of documents

        if (err){
            res.send(err)
            return
        }

        res.json(serverInfos); // return all todos in JSON format
    });
});

/* GET all the entries for the given server, between the two dates, and with only the number of players */
//http://localhost:3000/api/servers/46.105.42.129:30120
/*
*
 http://localhost:3000/api/servers/ avec ça on a la liste de toutes les entrées dans la bdd
 http://localhost:3000/api/servers/149.56.243.53:30121 tu as seulement les entrées spécifiques à l'ip indiquée
 http://localhost:3000/api/servers/149.56.243.53:30121?from=1499765300 tu as les entrées à partir du timestamp indiqué.
 http://localhost:3000/api/servers/149.56.243.53:30121?from=1499765300&to=1499765400 tu as les entrées entre les deux dates
 http://localhost:3000/api/servers/ avec ça on a la liste de toutes les entrées dans la bdd
 http://localhost:3000/api/servers/149.56.243.53:30121 tu as seulement les entrées spécifiques à l'ip indiquée
 Exemple de résultat pour ça :
 http://localhost:3000/api/servers/149.56.243.53:30121?from=1499765300
*
* */
router.get('/:server', function(req, res, next) {
    var searchParam = {};
    searchParam['ip'] = req.params.server;

    if (req.query.from){
        // TODO : check that the input is an integer
        logger.debug("Timestamp received: " + req.query.from * 1000);
        start = new Date(req.query.from * 1000);        // to get ms
    } else {
        start = new Date(0);    //from the beginning
    }

    if (req.query.to){
        // TODO : check that the input is an integer
        end = new Date(req.query.to * 1000);           // to get ms
    } else {
        end = new Date(Date.now());    //until now
    }

    logger.debug("Get Server info : server : " + req.params.server);
    logger.debug("Get Server info : start : " + start);
    logger.debug("Get Server info : end : " + end);

    model.ServerInfo.aggregate([
        {
            "$match": {
                "ip": req.params.server,
                "data.date": { "$gte": start, "$lt": end }
            }
        },
        {
            "$project": {
                "data": {
                    "$filter": {
                        "input": "$data",
                        "as": "data",
                        "cond": {
                            "$and": [
                                { "$gte": [ "$$data.date", start ] },
                                { "$lt": [ "$$data.date", end ] }
                            ]
                        }
                    }
                }
            }
        }

    ]).exec(function(err, serverInfos) {
        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err) {
            res.send(err)
            logger.debug("error while searching for data : " + err)
            return;
        }
        logger.debug("output find data : " + serverInfos)
        //TODO : nicely format the output so that i don't take as much place !

        // if no result since the last call, don't try
        var output = [];

        if (serverInfos != null && serverInfos.length != 0) {
            var result = serverInfos[0];
            for (var i = 0; i < result["data"].length; i++) {
                output.push(
                    {
                        x : result["data"][i]["date"].getTime(),        //timestamp
                        y : result["data"][i]["players"]
                    }
                );
            }
        }
        logger.debug("output: " + JSON.stringify(output));
        res.json(output); // return all todos in JSON format
    });
});

/*
app.get('/p/:tagId', function(req, res) {
    res.send("tagId is set to " + req.params.tagId);
});

// GET /p/5
// tagId is set to 5
If you want to get a query parameter ?tagId=5, then use req.query

app.get('/p', function(req, res) {
    res.send("tagId is set to " + req.query.tagId);
});
*/

// GET /p?tagId=5
// tagId is set to 5

// create todo and send back all todos after creation
/*
router.post('/api/todos', function(req, res) {

    // create a todo, information comes from AJAX request from Angular
    Todo.create({
        text : req.body.text,
        done : false
    }, function(err, todo) {
        if (err)
            res.send(err);

        // get and return all the todos after you create another
        Todo.find(function(err, todos) {
            if (err)
                res.send(err)
            res.json(todos);
        });
    });

});
*/

// delete a todo
/*
router.delete('/api/todos/:todo_id', function(req, res) {
    Todo.remove({
        _id : req.params.todo_id
    }, function(err, todo) {
        if (err)
            res.send(err);

        // get and return all the todos after you create another
        Todo.find(function(err, todos) {
            if (err)
                res.send(err)
            res.json(todos);
        });
    });
});
*/

/**
 *
 // checks if the from and to parameter are provided
 var filterParam = { $elemMatch : {
        date : {}
    }};
 if (req.query.from){
        // TODO : check that the input is an integer
        logger.debug("Timestamp received: " + req.query.from * 1000);
        filterParam["$elemMatch"]["date"]['$gte'] = new Date(req.query.from * 1000);        // to get ms
        logger.debug("Timestamp parsed: " + new Date(req.query.from * 1000));
    } else {
        filterParam["$elemMatch"]["date"]['$gte'] = 0;    //from the beginning
    }

 if (req.query.to){
        // TODO : check that the input is an integer
        filterParam["$elemMatch"]["date"]['$lt'] = new Date(req.query.to * 1000);           // to get ms
    } else {
        filterParam["$elemMatch"]["date"]['$lt'] = Date.now();    //until now
    }

 if (filterParam !== {}){
        searchParam['data'] = filterParam;
    }
 logger.debug(JSON.stringify(searchParam))

 model.ServerInfo.find(searchParam, 'data').exec(function(err, serverInfos) {
// if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err) {
            res.send(err)
            logger.debug("error while searching for data : " + err)
            return;
        }
        logger.debug("output find data : " + serverInfos)
        //TODO : nicely format the output so that i don't take as much place !

        // if no result since the last call, don't try
        var output = [];

        if (serverInfos.length != 0) {
            for (var i = 0; i < serverInfos[0]["data"].length; i++) {
                output.push(
                    {
                        x : serverInfos[0]["data"][i]["date"].getTime(),        //timestamp
                        y : serverInfos[0]["data"][i]["players"]
                    }
                );
            }
        }
        logger.debug("output: " + JSON.stringify(output));
        res.json(output); // return all todos in JSON format
    });
 */


module.exports = router;
