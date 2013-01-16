var camera, scene, renderer;
var mesh;

init();

window.addEventListener('mousemove', function () {
	throttledAnim();
});

function init() {
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	$('#nb').append(renderer.domElement);

	//

	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.z = 400;

	scene = new THREE.Scene();

	var geometry = new THREE.CubeGeometry( 200, 200, 200 );

	var texture = THREE.ImageUtils.loadTexture( 'textures/testpat_sq.png' );
	texture.anisotropy = renderer.getMaxAnisotropy();

	var material = new THREE.MeshBasicMaterial( { map: texture } );

	mesh = new THREE.Mesh( geometry, material );
	scene.add( mesh );

	//

	window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}

var throttledAnim = _.throttle(function () {
	requestAnimationFrame(function () {
		mesh.rotation.x += 0.005;
		mesh.rotation.y += 0.01;

		renderer.render( scene, camera );
	});
}, 1000 / 60);

$(window).bind('load', function () {
	throttledAnim();
});