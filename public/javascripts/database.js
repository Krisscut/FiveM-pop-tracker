/**
 * Created by STE14179 on 27/07/2017.
 */

function updateSpecs(){

    $.getJSON('/api/debug/infos/')
        .done(function (ajaxData) {


            $('#platform').text(ajaxData['platform']);
            $('#cpus').text(ajaxData['cpus']);
            $('#freeMem').text(ajaxData['freeMem']);
            $('#totalMem').text(ajaxData['totalMem']);
            $('#freeMemPercentage').text(ajaxData['freeMemPercentage']);
            $('#uptime').text(ajaxData['uptime']);
            $('#processTime').text(ajaxData['processTime']);
            $('#loadAvg').text(ajaxData['loadAvg']);


        })
        .fail(commons.handleError);
}

setInterval(updateSpecs, 1000);