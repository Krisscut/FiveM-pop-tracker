/**
 * Created by STE14179 on 10/07/2017.
 */
var mongoose = require('mongoose');
var logger = require('./logger');

// serverInfo data
var model = {};
var serverInfoSchema = mongoose.Schema({
    name : String,
    gameType : String,
    map : String,
    maxPlayer : Number,
    ip : String,
    data : [
        {
            date : { type: Date, default: Date.now },
            players :  Number
        }
    ]
});
serverInfoSchema.methods.display = function(){
    logger.info('Display data for server' + this.name + ":\n"
        + 'Gametype:' + this.gameType  +
        "\nMap: " +  this.map  +
        "\nmaxPlayer: " +  this.maxPlayer  +
        "\nip: " +  this.ip +
        "\ndata: " +  this.data)
}
model.ServerInfo = mongoose.model('ServerInfo', serverInfoSchema);

module.exports = model;