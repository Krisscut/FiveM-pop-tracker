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


router.get('/infos', function(req, res, next) {
    var obj = {};
    obj['platform'] = os.platform();
    obj['cpus'] = os.cpuCount();
    obj['freeMem'] = os.freemem();
    obj['totalMem'] = os.totalmem();
    obj['freeMemPercentage'] = os.freememPercentage()
    obj['uptime'] = os.sysUptime();
    obj['processTime'] = os.processUptime();
    obj['loadAvg'] = os.loadavg(1);

    res.json(obj);
});



module.exports = router;