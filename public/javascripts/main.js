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

function setLoading(activated){

    var hidden = $('#loading').hasClass("hidden");

    if (activated && hidden)
        $('#loading').transition('slide left')
    else if (!activated && !hidden)
        $('#loading').transition('slide left')


}

function fadeOutSetTextFadeIn(selector, text){
    selector.transition("fade");
    selector.text(text);
    selector.transition("fade");
}

var interval = undefined;
var fullIp = "46.105.42.129:30120";
//46.105.42.129:30120 for club V
var paramIP = getParameterByName("ip");

if (paramIP){
    fullIp = paramIP;
}

function refreshGraph() {

    if (interval)
        clearInterval(interval);


    $.getJSON('/api/servers/' + fullIp, function (data) {
        var lastCallDate = getCurrentUnixTimestamp();
        var result = [];

        data.forEach(function (elem) {

            var obj = [];
            obj.push(elem['x']);
            obj.push(elem['y']);

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
                        setLoading(false)
                        $('#categorySearch').removeClass("loading");

                        var series = this.series[0];
                        interval = setInterval(function () {
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
                                        obj.push(ajaxElem['x']);
                                        obj.push(ajaxElem['y']);
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
}




$('#searchField').click(function(){
    toastr["info"]("Implementation in progress, the graph will not refresh !! <br> You can altough use the 'ip' parameter in the url to get the data of a specific server :  index.html?ip=46.105.42.129:30120", "Work in progress");
});


$("#searchField").keyup(function(event){
    if(event.keyCode == 13){
        $("#searchIcon").click();
    }
});


$('#searchIcon').click(function() {
    var value;
    setLoading(true)
    $('#categorySearch').addClass("loading");

    if ($('#searchError').hasClass("visible"))
        $('#searchError').transition("fade");


    var value;
    if (!$('#searchField').val())
        value = fullIp;
    else
        value = $('#searchField').val()

    $.getJSON('/api/servers/' + value + '/infos')
        .done(function (data) {
            if (!data) {
                console.log("Error while retrieving data for the server " + $('#searchField').val())
                setLoading(false)
                $('#categorySearch').removeClass("loading");
                $('#searchError').transition("fade");
                return;
            }
            console.log(data);

            fadeOutSetTextFadeIn($('#name'), data['name'])
            fadeOutSetTextFadeIn($('#ip'), data['ip'])
            fadeOutSetTextFadeIn($('#maxPlayers'), data['maxPlayer'])
            fadeOutSetTextFadeIn($('#map'), data['map'])
            fadeOutSetTextFadeIn($('#gametype'), data['gameType'])

            fullIp = data['ip'];
            refreshGraph();         // refreshGraph handle the loading state of the application

            var host = window.location.hostname;
            $('#refLink').val(host + "?ip=" + data['ip'])

        }
)       .fail(function(){
            setLoading(false)
            commons.handleError();
            $('#categorySearch').removeClass("loading");
        });

});


$("#searchIcon").click();


$('.category .search')
    .search({
        type: 'category',
        minCharacters : 3,
        searchFullText: false,
        apiSettings: {
            url: 'api/servers/',
            onResponse: function(response) {
                var response = {
                        results : {}
                    }
                    ;

                // creates default category (ip / name)
                response.results['ip'] = {
                    name    : 'ip',
                    results : []
                };
                response.results['name'] = {
                    name    : 'name',
                    results : []
                };

                // translate server API response to work with search
                $.each(response.items, function(index, item) {

                    // add ip result to category
                    response.results[ip].results.push({
                        title       : item.ip,
                        description : item.name,
                        url         : item.ip
                    });
                    // add ip result to category
                    response.results[name].results.push({
                        title       : item.name,
                        description : item.ip,
                        url         : item.ip
                    });
                });
                return response;
            }
        }
    })
;