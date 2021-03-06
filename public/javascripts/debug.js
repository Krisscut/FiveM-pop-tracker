/**
 * Created by STE14179 on 13/07/2017.
 */
function updateSpecs(){

    $.getJSON('/api/debug/infos/')
        .done(function (ajaxData) {
            $('#platform').text(ajaxData['platform']);
            $('#cpus').text(ajaxData['cpus']);
            $('#freeMem').text(Math.round(ajaxData['freeMem']) + " Mo");
            $('#totalMem').text(Math.round(ajaxData['totalMem']) + " Mo");
            $('#freeMemPercentage').text(Math.round((ajaxData['freeMemPercentage'] * 100) * 100) / 100 + " %");
            $('#uptime').text(commons.secondsToHms(Math.round(ajaxData['uptime'])));
            $('#processTime').text(commons.secondsToHms(Math.round(ajaxData['processTime'])));
            $('#loadAvg').text(ajaxData['loadAvg']);


        })
        .fail(commons.handleError);
}

setInterval(updateSpecs, 1000);


function getCurrentUnixTimestamp(){
    return Math.round((new Date()).getTime() / 1000);
}

var maxSamples = 60;

Highcharts.setOptions({
    global: {
        useUTC: false
    }
});
// Create the chart
Highcharts.stockChart('container', {
    chart: {
        zoomType: "",
        defaultSeriesType: 'spline',
        events: {
            load: function () {
                // set up the updating of the chart each second
                $('#loading').transition('slide left')//.addClass("hidden");

                var rss = this.series[0];
                var heapTotal = this.series[1];
                var heapUsed = this.series[2];
                var external = this.series[3];
                var count = 0;
                setInterval(function () {
                    $.getJSON('/api/debug/memory/')
                    .done(function (ajaxData) {
                            var time = Date.now();

                            var shift = (++count >= maxSamples)

                            var rssObj = [time, ajaxData['rss']];
                            rss.addPoint(rssObj, false, shift);

                            var heapTotalObj = [time, ajaxData['heapTotal']];
                            heapTotal.addPoint(heapTotalObj, false, shift);

                            var heapUsedObj = [time, ajaxData['heapUsed']];
                            heapUsed.addPoint(heapUsedObj, false, shift);

                            var externalObj = [time, ajaxData['external']];
                            external.addPoint(externalObj, true, shift);


                    })
                    .fail(function( jqxhr, textStatus, error ) {
                      var err = textStatus + ", " + error;
                      console.log( "Request Failed: " + err );
                      toastr["error"]("Failed to retrieve data from the server !", "Error !");
                    });
                }, 1000);
            }
        }
    },
    legend: {
        enabled: true,
    },
    navigator: {
        enabled: false
    },
    scrollbar: {
        enabled: false
    },
    rangeSelector: {
        enabled:false,
        inputEnabled: false
    },

    title: {
        text: 'Memory consumption of the application'
    },
    subtitle: {
        text: document.ontouchstart === undefined ?
            'Refreshed every minutes' : 'Pinch the chart to zoom in'
    },
    yAxis: {
            min: 0,
            allowDecimals: false,
            title: {
                text: 'Consumption'
            },
            plotLines: [{
                value: 0,
                width: 2,
                color: 'silver'
            }]
    },
    exporting: {
        enabled: false
    },
    series: [{
        name: 'rss',
        data: []
    },{
        name: 'heapTotal',
        data: []
    },{
        name: 'heapUsed',
        data: []
    },{
        name: 'external',
        data: []
    }]
});


Highcharts.stockChart('containerCPU', {
    chart: {
        type: 'spline',
        animation: Highcharts.svg, // don't animate in old IE
        marginRight: 10,
        events: {
            load: function () {

                var rss = this.series[0];
                var count = 0;
                setInterval(function () {
                    $.getJSON('/api/debug/cpu/')
                        .done(function (ajaxData) {
                            var time = Date.now();

                            var shift = (++count >= maxSamples)

                            var rssObj = [time, ajaxData];
                            rss.addPoint(rssObj, true, shift);
                        })
                        .fail(function( jqxhr, textStatus, error ) {
                            var err = textStatus + ", " + error;
                            console.log( "Request Failed: " + err );
                            toastr["error"]("Failed to retrieve data from the server !", "Error !");
                        });
                }, 1000);
            }
        }
    },
    title: {
        text: 'Live CPU Usage'
    },
    xAxis: {
        type: 'datetime',
        tickPixelInterval: 150
    },
    navigator: {
        enabled: false
    },
    scrollbar: {
        enabled: false
    },
    rangeSelector: {
        enabled:false,
        inputEnabled: false
    },
    yAxis: {
        min: 0,
        title: {
            text: 'CPU %'
        },
        labels: {
            formatter: function() {
                return this.value *100+"%";
            }
        },
        plotLines: [{
            value: 0,
            width: 1,
            color: '#808080'
        }]
    },
    legend: {
        enabled: false
    },
    exporting: {
        enabled: false
    },
    series: [{
        name: 'CPU Usage',
        data: []
    }]
});

