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
router.get('/:server', function(req, res, next) {
    var searchParam = {};
    searchParam['ip'] = req.params.server;

    // checks if the from and to parameter are provided
    var filterParam = {};
    if (req.query.from){
        // TODO : check that the input is an integer
        logger.debug("Timestamp received: " + req.query.from * 1000);
        filterParam['$gte'] = new Date(req.query.from * 1000);        // to get ms
        logger.debug("Timestamp parsed: " + new Date(req.query.from * 1000));
    } else {
        filterParam['$gte'] = 0;    //from the beginning
    }

    if (req.query.to){
        // TODO : check that the input is an integer
        filterParam['$lt'] = new Date(req.query.to * 1000);           // to get ms
    } else {
        filterParam['$lt'] = Date.now();    //until now
    }

    if (filterParam !== {}){
        searchParam['date'] = filterParam;
    }


    model.ServerInfo.find(searchParam, 'playerNumber date').exec(function(err, serverInfos) {

        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err)
            res.send(err)

        res.json(serverInfos); // return all todos in JSON format
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


module.exports = router;
