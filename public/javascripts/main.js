/**
 * Created by STE14179 on 13/07/2017.
 */


function getCurrentUnixTimestamp(){
    return Math.round((new Date()).getTime() / 1000);
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

var fullIp = "149.56.243.53:30121";
//46.105.42.129:30120 for club V
var paramIP = getParameterByName("ip");

if (paramIP){
    fullIp = paramIP;
}

$.getJSON('/api/servers/' + fullIp, function (data) {
    var lastCallDate = getCurrentUnixTimestamp();
    var result = [];

    data.forEach(function (elem) {

        var obj = [];
        obj.push(new Date(elem['date']).getTime());
        obj.push(elem['playerNumber']);

        result.push(obj);
    });

    Highcharts.setOptions({
        global: {
            useUTC: false
        }
    });

    // Create the chart
    Highcharts.stockChart('container', {
        chart: {
            events: {
                load: function () {
                    // set up the updating of the chart each second
                    $('#loading').transition('slide left')//.addClass("hidden");

                    var series = this.series[0];
                    setInterval(function () {
                        $.getJSON('/api/servers/' + fullIp + "?from="+lastCallDate, function (ajaxData) {

                            if (ajaxData.length == 0){  //if empty array, insert a new point with the same number of players
                                var lastPoint = series.data[series.data.length-1];
                                lastPoint[0] = Date.now();
                                series.addPoint(lastPoint);
                            }
                            ajaxData.forEach(function (ajaxElem) {

                                var obj = [];
                                obj.push(new Date(ajaxElem['date']).getTime());
                                obj.push(ajaxElem['playerNumber']);
                                series.addPoint(obj, true, true);
                            });
                            lastCallDate = getCurrentUnixTimestamp();       // memorize to only retrieve the last entries instead of the whole graph
                        });


                    }, 60000);
                }
            }
        },

        rangeSelector: {
            buttons: [{
                count: 5,
                type: 'minute',
                text: '5M'
            }, {
                count: 1,
                type: 'hour',
                text: '1H'
            }, {
                count: 1,
                type: 'day',
                text: '1d'
            },{
                count: 7,
                type: 'day',
                text: '1w'
            }, {
                type: 'all',
                text: 'All'
            }],
            inputEnabled: true,
            selected: 1
        },

        title: {
            text: 'Number of players connected for the server ' + fullIp
        },
        subtitle: {
            text: document.ontouchstart === undefined ?
                'Refreshed every minutes' : 'Pinch the chart to zoom in'
        },
        plotOptions: {
            line: {
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                },
                marker: {
                    radius: 2
                },
                lineWidth: 1,
                states: {
                    hover: {
                        lineWidth: 1
                    }
                },
                threshold: null
            }
        },
        exporting: {
            enabled: false
        },
        series: [{
            type: 'line',
            name: 'Players connected',
            data: result
        }]
    });
});