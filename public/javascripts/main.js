/**
 * Created by STE14179 on 13/07/2017.
 */


toastr.options = {
  "closeButton": true,
  "debug": false,
  "newestOnTop": true,
  "progressBar": true,
  "positionClass": "toast-bottom-right",
  "preventDuplicates": false,
  "onclick": null,
  "showDuration": "300",
  "hideDuration": "1000",
  "timeOut": "5000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}


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

var fullIp = "46.105.42.129:30120";
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
                        $.getJSON('/api/servers/' + fullIp + "?from="+lastCallDate)
                        .done(function (ajaxData) {

                            if (!ajaxData || ajaxData.length == 0){  //if empty array, insert a new point with the same number of players
                                var lastPoint = series.data[series.data.length-1];

                                var obj = [];
                                obj.push(Date.now());
                                obj.push(lastPoint.y);
                                
                                series.addPoint(obj);
                            }
                            ajaxData.forEach(function (ajaxElem) {

                                var obj = [];
                                obj.push(new Date(ajaxElem['date']).getTime());
                                obj.push(ajaxElem['playerNumber']);
                                series.addPoint(obj, true, true);
                            });
                            lastCallDate = getCurrentUnixTimestamp();       // memorize to only retrieve the last entries instead of the whole graph
                        })
                        .fail(function( jqxhr, textStatus, error ) {
                          var err = textStatus + ", " + error;
                          console.log( "Request Failed: " + err );
                          toastr["error"]("Failed to retrieve data from the server !", "Error !");
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
        yAxis: {
                min: 0,
                allowDecimals: false,
                title: {
                    text: 'Players Connected'
                }
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