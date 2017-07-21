/**
 * Created by STE14179 on 10/07/2017.
 */
var logger = require('./logger');
var constants = require('./constants');
var https = require('https');
var cheerio = require('cheerio');
var model = require('./model');
var db = require('./db');

logger.info('Starting tracker');

function getTrackerData() {
    logger.debug('Performing tracker checks');

    var options = {
        host: constants.TARGET_URL,
        port: 443,
        path: '/'
    };

    https.get(options, function(res){
        var output = '';
        console.time("getData");
        logger.debug("Got response: " + res.statusCode);

        res.on('data', function (chunk) {
            output += chunk;
        });

        res.on('end', function() {
            console.timeEnd("getData");
            logger.debug("Calling on result");
            onDataReceived(res.statusCode, output);
        });
    }).on('error', function(e) {
        logger.debug("Got error: " + e.message);
    });

}

/**
 * Called when the we successfully retrieved the datas from the online checker
 * @param statusCode
 * @param body
 */
function onDataReceived(statusCode, body){
    console.time("processData");

    const $ = cheerio.load(body);       // load the html in the jquery like selector

    // check each server line :
    $trs = $('tr');

    var targetFound = false;
    $trs.each(function(i, elem) {         // iteration on each server entry
        var serverSelected = $(this);
        var serverContent = serverSelected.find('td');

        // on the first pass, serverContent is gonna be undefined (name of the columns in th)

        if (serverContent.length != 0 ){
            var serverInfo = {};
            serverInfo["name"] = serverContent.eq(0).text();
            serverInfo["gameType"] = serverContent.eq(1).text();
            serverInfo["map"] = serverContent.eq(2).text();

            var strPlayerNumber = serverContent.eq(3).text();
            var regex = /([0-9]+)\s\(([0-9]+)\)/;
            var result = regex.exec(strPlayerNumber);
            serverInfo["playerNumber"] = result[1];
            serverInfo["maxPlayer"] = result[2];

            serverInfo["ip"] = serverContent.eq(4).text();
            serverInfo["date"] = Date.now();

            if (constants.FILTER == false || constants.TARGETS.includes(serverInfo["ip"])) {
                logger.debug("Found targeted server with index " + i + " : " + JSON.stringify(serverInfo));
                //console.timeEnd("processData");
                onServerInfoParsed(serverInfo);
                //targetFound = true;
                //return false;   // break the loop
            }
        }
    });
    //if (!targetFound) {
        console.timeEnd("processData");
        //logger.info("Target not found, the server with the ip '" + constants.TARGET_FULL_IP + "' is not in the listed servers.");
    //}
}

/**
 * Checks if the number of player has changed since the last check, insert into the database if yes
 */
function onServerInfoParsed(serverInfo){
    var server = new model.ServerInfo (serverInfo);
    //server.display();

    //get last entry and check for the last registered info
    /*
    db.getLastEntry(model.ServerInfo, function(err, listServerInfo){

        if (listServerInfo.length == 0){
            logger.info("No entry in the database");
            return;
        } else {
            //comparison of the entries in the DB

        }
    });
    */
    //server.save();
    model.ServerInfo.findOne({"ip" : serverInfo.ip}).select({ "data": { "$slice": -1 }}).exec(function(err, dbServerInfo){
        if(err)
            return logger.error(err);

        if (dbServerInfo == null){
            logger.warn("No entry in the database for the server " +  server.ip + " - Added the server to the database");
            server.data = [];       // empty data
            server.data.push({date: serverInfo["date"], players: serverInfo["playerNumber"]});
            server.save();
        } else {
            //comparison of the entries in the DB
            //logger.debug("checking with previous entry in the database");
            // if there is an evolution in the number of player online, insert the new document
            logger.debug("data: " + dbServerInfo.data);
            logger.debug("id " + dbServerInfo._id);
            if (dbServerInfo.data.pop()["players"] != serverInfo["playerNumber"]) {

                // create another point just before the change
                //var serverPointBefore = new model.ServerInfo (serverInfo);
                //serverPointBefore.date = serverPointBefore.date.getTime()-1;
                //serverPointBefore.playerNumber = dbServerInfo.playerNumber;
                //serverPointBefore.save();
                //dbServerInfo.save();
                //removed at the moment, too ugly !

                //logger.debug("Adding a new entry in the database, " + dbServerInfo.playerNumber + " != " + server.playerNumber );
                //server.data.push();
                //server.save();

                model.ServerInfo.findByIdAndUpdate(
                        dbServerInfo._id,
                        {$push: {"data": {date: serverInfo["date"], players: serverInfo["playerNumber"]}}},
                        {safe: true, upsert: true, new : true},
                        function(err, model) {
                            if (err)
                                console.log(err);
                        }
                    );
            } else {
                logger.debug("No change in the players connected for the server " + dbServerInfo.ip);
            }
        }
    });
}

module.exports = getTrackerData;