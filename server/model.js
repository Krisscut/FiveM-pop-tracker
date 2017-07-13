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
    playerNumber : Number,
    maxPlayer : Number,
    ip : String,
    date : { type: Date, default: Date.now }
});
serverInfoSchema.methods.display = function(){
    logger.info('Display data for server' + this.name + ":\n"
        + 'Gametype:' + this.gameType  +
        "\nMap: " +  this.map  +
        "\nPlayerNumber: " +  this.playerNumber  +
        "\nmaxPlayer: " +  this.maxPlayer  +
        "\nip: " +  this.ip +
        "\ndate: " +  this.date)
}
model.ServerInfo = mongoose.model('ServerInfo', serverInfoSchema);

module.exports = model;