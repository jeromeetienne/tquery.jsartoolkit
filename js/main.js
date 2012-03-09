var threexAR;

// setup three.js renderer
var renderer	= new THREE.WebGLRenderer({
	antialias	: true
});
renderer.setSize(640, 480);
document.body.appendChild(renderer.domElement);

// create the scene
var scene	= new THREE.Scene();

// Create a camera and a marker root object for your Three.js scene.
var camera	= new THREE.Camera();
scene.add(camera);

// setup lights
var light	= new THREE.DirectionalLight(0xffffff);
light.position.set(4, 5, 1).normalize();
scene.add(light);
var light	= new THREE.DirectionalLight(0xffffff);
light.position.set(-4, -5, -1).normalize();
scene.add(light);

//var material	= new THREE.MeshNormalMaterial();
//var geometry	= new THREE.TorusGeometry( 100, 42 );
//var mesh	= new THREE.Mesh(geometry, material);
//mesh.position.z = 50;
//scene.add(mesh);

//var loader = new THREE.ColladaLoader();
////loader.options.convertUpAxis = true;
//loader.load( './models/trumpet/models/trumpet.dae', function colladaReady( collada ) {
//	var dae = collada.scene;
////	skin = collada.skins[ 0 ];
//	
////	dae.scale.x = dae.scale.y = dae.scale.z = 0.002;
////	dae.updateMatrix();
//
//	scene.add( dae );
//
//} );

var teapotGeometry	= null;
new THREE.JSONLoader().load('models/teapot.js', function(geometry){
	console.log("geometry")
	console.dir(geometry);
	teapotGeometry	= geometry;
});

function animate(){	
	requestAnimationFrame(animate);
	render();
};

function render(){

	(function(){
		var videoCanvas	= videoTex.image;
		// copy the srcElement into videoCanvas
		videoCanvas.getContext('2d').drawImage(srcElement,0,0, videoCanvas.width, videoCanvas.height);
		// warn three.js that videoTex changed
		videoTex.needsUpdate	= true;
	}());
	// do a mirror X on the videoCanvas - usefull if the video is a webcam
	// - NOTE: this inverse the marker too... so detection fails...
	// - to inverse the marker image would fix it ?
	//;(function(){
	//	var ctx	= videoCanvas.getContext('2d');
	//	ctx.save();
	//	ctx.translate(videoCanvas.width,0);
	//	ctx.scale(-1,1);
	//	ctx.drawImage(srcElement,0,0, videoCanvas.width, videoCanvas.height);
	//	ctx.restore();
	//})();
	
	// TODO put this if() in THREEx.JSARToolKit
	if( srcElement instanceof HTMLImageElement ){
		threexAR.update();
	}else if( srcElement instanceof HTMLVideoElement && srcElement.readyState === srcElement.HAVE_ENOUGH_DATA ){
		threexAR.update();
	}

	// trigger the rendering
	renderer.autoClear = false;
	renderer.clear();
	renderer.render(videoScene, videoCam);
	renderer.render(scene, camera);
};

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////


window.onload	= function(){
	threexAR	= new THREEx.JSARToolKit();
	animate();
};

// create the video element for the webcam
var videoEl	= document.createElement('video');
videoEl.width	= 320;
videoEl.height	= 240;
videoEl.loop	= true;
videoEl.volume	= 0;
videoEl.autoplay= true;
videoEl.controls= true;

var threshold	= 128;

if( false ){
	// sanity check - if the API available
	if( !navigator.getUserMedia )	throw new Error("navigator.getUserMedia not found.");
	if( !window.URL )		throw new Error("window.URL not found.");
	if(!window.URL.createObjectURL)	throw new Error("window.URL.createObjectURL not found.");

	navigator.getUserMedia('video', function(stream) {
		videoEl.src	= window.URL.createObjectURL(stream);
	}, function(error) {
		alert("Couldn't access webcam.");
	});
	threshold	= 128;
	document.body.appendChild(videoEl);
	var srcElement	= videoEl;
}

if( true ){
	videoEl.src = './videos/swap_loop.ogg';
	document.body.appendChild(videoEl);	
	var srcElement	= videoEl;
	threshold	= 50;
}

if( false ){
	var image	= document.createElement("img");
	image.setAttribute('src', 'images/armchair.jpg');
	document.body.appendChild(image);
	var srcElement	= image;
	threshold	= 150;
}

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

// TODO global to remove
var videoTex;
var videoCam, 	videoScene;

// Create scene and quad for the video.
// - TODO this canvas seems useless
var videoCanvas		= document.createElement('canvas');
videoCanvas.width	= srcElement.width;
videoCanvas.height	= srcElement.height;
// ASK: so jsartoolkit work only with 3/4 aspect ? it truncate: the output.. not cool
//videoCanvas.height	= srcElement.width*3/4;
videoTex 	= new THREE.Texture(videoCanvas);
var geometry	= new THREE.PlaneGeometry(2, 2, 0);
var material	= new THREE.MeshBasicMaterial({
	color		: 0x4444AA,
	map		: videoTex,
	depthTest	: false,
	depthWrite	: false
});
var plane	= new THREE.Mesh(geometry, material );
videoScene	= new THREE.Scene();
videoCam	= new THREE.Camera();
videoScene.add(plane);
videoScene.add(videoCam);

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////


var THREEx	= THREEx	|| {};
THREEx.JSARToolKit	= function(opts){
	// parse arguments
	opts			= opts || {};
	this._threshold		= opts.threshold !== undefined ? opts.threshold : 50;	
	this._debug		= opts.debug !== undefined ? opts.debug : false;
	this._canvasRasterW	= opts.canvasRasterW || 640;
	this._canvasRasterH	= opts.canvasRasterH || 480;
// TODO add srcElement

	this._markers	= {};
	
	var canvasRaster	= document.createElement('canvas');
	this._canvasRaster	= canvasRaster;
	canvasRaster.width	= this._canvasRasterW;
	canvasRaster.height	= this._canvasRasterH;
	document.body.appendChild(canvasRaster);
	
	// enable the debug
	if( this._debug ){
		// to enable/disable debug output in jsartoolkit
		// FIXME this is a global... not even prefixed...
		DEBUG		= true;
		
		// apparently debug canvas is directly updated by jsartoolkit
		var debugCanvas		= document.createElement('canvas');
		debugCanvas.id		= 'debugCanvas';
		debugCanvas.width	= canvasRaster.width;
		debugCanvas.height	= canvasRaster.height;
		document.body.appendChild(debugCanvas);		
	}

	var arRaster	= new NyARRgbRaster_Canvas2D(canvasRaster);
	var arParam	= new FLARParam(canvasRaster.width,canvasRaster.height);
	var arDetector	= new FLARMultiIdMarkerDetector(arParam, 120);
	arDetector.setContinueMode(true);
	this._arRaster	= arRaster;
	this._arDetector= arDetector;
      
	// Next we need to make the Three.js camera use the FLARParam matrix.
	var tmpGlMatCam	= new Float32Array(16);
	arParam.copyCameraMatrix(tmpGlMatCam, 10, 10000);
	this._copyMatrixGl2Threejs(tmpGlMatCam, camera.projectionMatrix);
}

/**
 * update to call at every rendering-loop iteration
*/
THREEx.JSARToolKit.prototype.update	= function()
{
	var canvasRaster= this._canvasRaster;
	var markers	= this._markers;
	var arRaster	= this._arRaster;
	var arDetector	= this._arDetector;

	var ctxRaster	= canvasRaster.getContext('2d');
	// copy srcElement into canvasRaster
	ctxRaster.drawImage(srcElement, 0,0, ctxRaster.canvas.width, ctxRaster.canvas.height);
	// warn JSARToolKit that the canvas changed
	canvasRaster.changed	= true;

	// detect markers
	var nDetected	= arDetector.detectMarkerLite(arRaster, this._threshold);
	var tmpArMat	= new NyARTransMatResult();
	for (var idx = 0; idx < nDetected; idx++) {
		var markerId;
		// extract the markerId
		var id	= arDetector.getIdMarkerData(idx);
		if (id.packetLength > 4) {
			markerId = -1;
		}else{
			markerId = 0;
			for (var i = 0; i < id.packetLength; i++ ) {
				markerId = (markerId << 8) | id.getPacketData(i);
			}
		}
		// define the marker if needed
		markers[markerId]	= markers[markerId] || {};
		markers[markerId].age	= 0;
		// FIXME Object.asCopy is a dirty kludge - jsartoolkit is declaring this on global space 
		arDetector.getTransformMatrix(idx, tmpArMat);
		markers[markerId].transform = Object.asCopy(tmpArMat);
	}
	// handle markers age - deleting old markers too
	// marker.age is the amount of iteration without detection
	Object.keys(markers).forEach(function(markerId){
		var marker = markers[markerId];
		if( marker.age > 3) {
			delete markers[markerId];
			scene.remove(marker.object3d);
		}
		marker.age++;
	});
	// create and update object3d associated to markers
	var tmpGlMat	= new Float32Array(16);
	Object.keys(markers).forEach(function(markerId){
		var marker = markers[markerId];
		if( !marker.object3d ){
			var cube = new THREE.Mesh(
				//teapotGeometry ||
				new THREE.CubeGeometry(100,100,100),
				new THREE.MeshLambertMaterial({color: 0|(0xffffff*Math.random())})
				//new THREE.MeshNormalMaterial()
			);
			
			//cube.position.y	=  25;
			cube.position.z		= -50;

			//cube.rotation.y	= -Math.PI/2;
			//cube.rotation.z	= Math.PI;

			//cube.scale.set(20, 20, 20);

			// create the container object
			// TODO is that needed
			marker.object3d = new THREE.Object3D();
			marker.object3d.matrixAutoUpdate = false;
			marker.object3d.add(cube);
			scene.add(marker.object3d);
		}
		this._copyMatrixAr2Gl(marker.transform, tmpGlMat);
		if( true ){
			// FIXME there is a bug here - see if you can do that at the matrix level
			//marker.object3d.children[0].doubleSided	= true;
			marker.object3d.children[0].scale.set(-1, -1, -1);
			this._copyMatrixGl2Threejs(tmpGlMat, marker.object3d.matrix);
		}else{		
			// tried to fix the doubleSided bug in the matrix
			var tmpTjMat	= new THREE.Matrix4();
			this._copyMatrixGl2Threejs(tmpGlMat, tmpTjMat);
			var scaleMat	= new THREE.Matrix4().setScale(-1, -1, -1);
			marker.object3d.matrix.multiply(tmpTjMat, scaleMat);
		}
		marker.object3d.matrixWorldNeedsUpdate = true;				
	}.bind(this));
}

//////////////////////////////////////////////////////////////////////////////////
//		matrix conversion						//
//////////////////////////////////////////////////////////////////////////////////

/**
 * copy glmatrix to three.js matrix
*/
THREEx.JSARToolKit.prototype._copyMatrixGl2Threejs	 = function(m, tMat){
	// argument - sanity check
	console.assert( m instanceof Float32Array && m.length === 16 );
	console.assert( tMat instanceof THREE.Matrix4 );

	return tMat.set(
		m[0], m[4], m[8], m[12],
		m[1], m[5], m[9], m[13],
		m[2], m[6], m[10], m[14],
		m[3], m[7], m[11], m[15]
	);
};

/**
 * copy matrix from JSARToolKit to glmatrix
*/
THREEx.JSARToolKit.prototype._copyMatrixAr2Gl	 = function(mat, cm){
	// argument - sanity check
	console.assert( cm instanceof Float32Array && cm.length === 16 );
	console.assert( mat.className === 'NyARTransMatResult' );

	cm[0]	=  mat.m00;
	cm[1]	= -mat.m10;
	cm[2]	=  mat.m20;
	cm[3]	=  0;
	cm[4]	=  mat.m01;
	cm[5]	= -mat.m11;
	cm[6]	=  mat.m21;
	cm[7]	=  0;
	cm[8]	= -mat.m02;
	cm[9]	=  mat.m12;
	cm[10]	= -mat.m22;
	cm[11]	=  0;
	cm[12]	=  mat.m03;
	cm[13]	= -mat.m13;
	cm[14]	=  mat.m23;
	cm[15]	=  1;
};
