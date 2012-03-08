// shim for navigator.getUserMedia
navigator.getUserMedia	= navigator.getUserMedia
			|| navigator.webkitGetUserMedia
			|| navigator.mozGetUserMedia
			|| navigator.msGetUserMedia
			|| navigator.oGetUserMedia;

// shim for window.URL.createObjectURL
window.URL	= window.URL || window.webkitURL;
if( window.URL ){
	window.URL.createObjectURL	= window.URL.createObjectURL || webkitURL.createObjectURL;
}

