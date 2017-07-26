/**
 * Created by STE14179 on 26/07/2017.
 */


var express = require('express');
var router = express.Router();
var logger = require('../server/logger');
var os 	= require('os-utils');

router.get('/memory', function(req, res, next) {
        res.json(process.memoryUsage());
});

router.get('/cpu', function(req, res, next) {
    os.cpuUsage(function(v){
        res.json(v);
    });

});



module.exports = router;