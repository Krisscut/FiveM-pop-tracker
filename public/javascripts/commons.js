/**
 * Created by STE14179 on 27/07/2017.
 */

var commons = {};

commons.handleError = function handleError( jqxhr, textStatus, error ) {
    var err = textStatus + ", " + error;
    console.log( "Request Failed: " + err );
    toastr["error"]("Failed to retrieve data from the server !", "Error !");
}


commons.secondsToHms = function secondsToHms(duration) {
    duration = Number(duration);
    var d = Math.floor(duration / (3600*24));
    var h = Math.floor(duration % (3600*24) / 3600);
    var m = Math.floor((duration % (3600*24)) % 3600 / 60);
    var s = Math.floor((duration % (3600*24)) % 3600 % 60);

    var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
    var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return dDisplay + hDisplay + mDisplay + sDisplay;
}

function openInNewTab(url) {
    var win = window.open(url, '_blank');
    win.focus();
}

// executed on all pages
$('#menuLogo').click(function(){
    $('.sidebar')
        .sidebar('show')
    ;
});