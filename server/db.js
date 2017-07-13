/**
 * Created by STE14179 on 10/07/2017.
 */
var mongoose = require('mongoose');

var options = { server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
    replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } } };



var db = {};
db.connect = function connect(){
    mongoose.connection.openUri('mongodb://localhost:27017/tracker', options);        // database : user @ adress : /password

    var connection = mongoose.connection;
    connection.on('error', function(err) {
        // log error, abort app start
        console.info("DB error !" + err);
        throw err;
    });
    connection.once('open', function() {
        // we're connected!
        console.info("DB connected !")
    });
}


/**
 * Returns the last entry for the given module
 * @param model
 * @returns {*|{distinct, count}}
 */
db.getLastEntry = function getLastEntry(model, callback){
    model.findOne().sort({ field: 'asc', _id: -1 }).limit(1).exec(callback);
}

module.exports = db;