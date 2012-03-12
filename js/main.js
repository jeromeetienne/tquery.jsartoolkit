var threexAR;

// setup three.js renderer
var renderer	= new THREE.WebGLRenderer({
	antialias	: true
});
renderer.setSize(320, 240);
renderer.setSize(320*2.5, 240*2.5);
document.body.appendChild(renderer.domElement);

// create the scene
var scene	= new THREE.Scene();

// Create a camera and a marker root object for your Three.js scene.
//var camera	= new THREE.Camera();
//scene.add(camera);

var camera = new THREE.PerspectiveCamera(35, renderer.domElement.width/renderer.domElement.height, 1, 10000 );
camera.position.set(0, 0, 5);
scene.add(camera);

// setup lights
scene.add(new THREE.AmbientLight(0xffffff));

var light	= new THREE.DirectionalLight(0xffffff);
light.position.set(3, -3, 1).normalize();
scene.add(light);

var light	= new THREE.DirectionalLight(0xffffff);
light.position.set(-0, 2, -1).normalize();
scene.add(light);

var material	= new THREE.MeshNormalMaterial();
var geometry	= new THREE.TorusGeometry( 10, 3 );
var mesh	= new THREE.Mesh(geometry, material);
mesh.position.z = -5;
scene.add(mesh);

if( true ){
	new THREE.JSONLoader().load('models/teapot.js', function(geometry){
		var material	= new THREE.MeshNormalMaterial();
		var mesh	= new THREE.Mesh(geometry, material);
		mesh.position.z	= -10;
		scene.add(mesh);
	});	
}

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

// create the video element for the webcam
var videoEl	= document.createElement('video');
videoEl.width	= 320;
videoEl.height	= 240;
videoEl.loop	= true;
videoEl.volume	= 0;
videoEl.autoplay= true;
videoEl.controls= true;

if( true ){
	// sanity check - if the API available
	if( !navigator.getUserMedia )	throw new Error("navigator.getUserMedia not found.");
	if( !window.URL )		throw new Error("window.URL not found.");
	if(!window.URL.createObjectURL)	throw new Error("window.URL.createObjectURL not found.");
	navigator.getUserMedia('video', function(stream) {
		videoEl.src	= window.URL.createObjectURL(stream);
	}, function(error) {
		alert("Couldn't access webcam.");
	});
	var threshold	= 128;
	var srcElement	= videoEl;
}

if( false ){
	videoEl.src = './videos/swap_loop.ogg';
	var srcElement	= videoEl;
	var threshold	= 50;
}
 
if( false ){
	var image	= document.createElement("img");
	image.setAttribute('src', 'images/armchair.jpg');
	var srcElement	= image;
	var threshold	= 150;
}
if( false ){
	var image	= document.createElement("img");
	image.setAttribute('src', 'images/chalk_multi.jpg');
	var srcElement	= image;
	var threshold	= 110;
}

// add srcElement to the DOM
srcElement.id		= 'srcElement';
document.body.appendChild(srcElement);	

// update the UI
document.querySelectorAll("#thresholdText")[0].innerHTML	= threshold;
document.querySelectorAll("#thresholdRange")[0].value		= threshold;

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

// TODO global to remove
var videoTex;
var videoCam, 	videoScene;

// Create scene and quad for the video.
videoTex 	= new THREE.Texture(srcElement);
var geometry	= new THREE.PlaneGeometry(2, 2, 0);
var material	= new THREE.MeshBasicMaterial({
	color		: 0x4444AA,
	color		: 0x6666FF,
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


function animate(){	
	requestAnimationFrame(animate);
	render();
};

function render(){

	if( true ){
		if( srcElement instanceof HTMLImageElement ){
			videoTex.needsUpdate	= true;
			threexAR.update();
		}else if( srcElement instanceof HTMLVideoElement && srcElement.readyState === srcElement.HAVE_ENOUGH_DATA ){
			videoTex.needsUpdate	= true;
			threexAR.update();
		}		
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
	//animate();return;
	var markers	= {};
	var onCreate	= function(event){
		console.assert(	markers[event.markerId] === undefined );
		var markerId	= event.markerId;
		markers[markerId]= {};
		var marker	= markers[markerId];
		// create the container object
		marker.object3d = new THREE.Object3D();
		marker.object3d.matrixAutoUpdate = false;
		scene.add(marker.object3d);		

		if( false ){
			var material	= new THREE.MeshLambertMaterial({color: 0|(0xffffff*Math.random())});
			var geometry	= new THREE.CubeGeometry(100,100,100);
			var mesh	= new THREE.Mesh(geometry, material);
			mesh.position.z	= -50;			
			// FIXME there is a bug here - see if you can do that at the matrix level
			//mesh.scale.set(-1, -1, -1);
			mesh.doubleSided= true;
			marker.object3d.add(mesh);
		}
		if( true ){
			var material	= new THREE.MeshLambertMaterial({color: 0xFFFF00});
			var geometry	= new THREE.CylinderGeometry(50,0,100);
			var mesh	= new THREE.Mesh(geometry, material);
			mesh.rotation.x	= Math.PI/3;
			mesh.rotation.z	= -Math.PI/10;
			mesh.position.x	= -30;
			mesh.position.y	=  45;
			mesh.position.z	= -50;
			// FIXME there is a bug here - see if you can do that at the matrix level
			//mesh.scale.set(-1, -1, -1);
			mesh.doubleSided= true;
			marker.object3d.add(mesh);

			var material	= new THREE.MeshLambertMaterial({color: 0xFF0000});
			var geometry	= new THREE.SphereGeometry(20,20,20);
			var mesh	= new THREE.Mesh(geometry, material);
			mesh.rotation.x	= Math.PI/3;
			mesh.rotation.z	= -Math.PI/10;
			mesh.position.x	= -0;
			mesh.position.y	= 150;
			mesh.position.z	= -50;
			// FIXME there is a bug here - see if you can do that at the matrix level
			//mesh.scale.set(-1, -1, -1);
			mesh.doubleSided= true;
			marker.object3d.add(mesh);
		}
	};
	var onDelete	= function(event){
		console.assert(	markers[event.markerId] !== undefined );
		var markerId	= event.markerId;
		var marker	= markers[markerId];
		scene.remove( marker.object3d );
		delete markers[markerId];
	};
	var onUpdate	= function(event){
		console.assert(	markers[event.markerId] !== undefined );
		var markerId	= event.markerId;
		var marker	= markers[markerId];

		marker.object3d.matrix.copy(event.matrix);
		marker.object3d.matrixWorldNeedsUpdate = true;		
	};
	threexAR	= new THREEx.JSARToolKit({
		srcElement	: srcElement,
		threshold	: threshold,
		//canvasRasterW	: 640,
		//canvasRasterH	: 480,
		debug		: true,
		callback	: function(event){
			//console.log("event", event.type, event.markerId)
			if( event.type === 'create' ){
				onCreate(event);
			}else if( event.type === 'delete' ){
				onDelete(event);
			}else if( event.type === 'update' ){
				onUpdate(event);
			}else	console.assert(false, "invalid event.type "+event.type);
		}
	});

	// add threexAR.canvasRaster()) to the DOM
	threexAR.canvasRaster().id	= 'canvasRaster';
	document.body.appendChild(threexAR.canvasRaster());	

	// start the animation
	animate();
};
