$(document).ready(function(){
	var sessionId = "";
	$('#progress-bar').css({width: "0%"});
	$('#upload-progress').hide();

	$('#files').on('change',function(){
        $('#files-list').append( $('<li />') );
    });

	$('a,button').on('click', function() {
		window.onbeforeunload = null;
	});
});

var isUploading= false;

io.socket.on( sessionUUID, function(msg) {


  isUploading = true;
	$('#upload-progress').show();
	$('.sign-up.button').html('Uploading...').attr('disabled', 'disabled');
  document.getElementById('percent').innerHTML = '<b>' + msg.percent + '%</b> uploaded';
	document.getElementById('totalSize').innerHTML		='<b>File Size</b> ' + getReadableFileSizeString(msg.totalSize) ;
	document.getElementById('totalUploaded').innerHTML	='<b>Bytes Uploaded</b> ' + getReadableFileSizeString(msg.totalUploaded) + ' uploaded';
	document.getElementById('duration').innerHTML		='<b>Duration</b> ' +  secsToTimeFormat(msg.duration);
	document.getElementById('kbspeed').innerHTML		='<b>Speed in Kb</b> ' + msg.speedKbps + ' Kb/s';
	document.getElementById('mbspeed').innerHTML		='<b>Speed in Mb</b> ' + msg.speedMbps + ' Mb/s';
	document.getElementById('fileName').innerHTML		='<b>Uploading file</b> ' + msg.fileName ;

	$('#progress-bar').css({width: msg.total + '%'});
});

function secsToTimeFormat( secs) {
    var sec_num = secs; // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    var time    = hours+':'+minutes+':'+seconds;
    return time;
}

function getReadableFileSizeString(fileSizeInBytes) {
    var i = -1;
    var byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
    do {
        fileSizeInBytes = fileSizeInBytes / 1024;
        i++;
    } while (fileSizeInBytes > 1024);

    return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
}
window.onbeforeunload = confirmExit;
function confirmExit() {
	var msg = '';
	if(isUploading){
    msg = "Oops! It looks like you're uploading a file. \n Are you sure you want to quit the upload?"
	}
	return msg;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
