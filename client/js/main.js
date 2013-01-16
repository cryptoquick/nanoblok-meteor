var fogExp2 = true;

var container, stats;

var camera, controls, scene, renderer;

var mesh, mat;

var worldWidth = 200, worldDepth = 200,
worldHalfWidth = worldWidth / 2, worldHalfDepth = worldDepth / 2,
data = [];

var clock;

var stop = false;

var indices = {},
	spatial = {};

function main () {
	if ( ! Detector.webgl ) {

		Detector.addGetWebGLMessage();
		document.getElementById( 'container' ).innerHTML = "";

	}
	console.log(worldWidth);
	data = generateHeight( worldWidth, worldDepth );
	clock = new THREE.Clock();
	init();

	function init() {

		container = document.getElementById( 'nb' );

		camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 20000 );
		camera.position.z = 2500;

		controls = new THREE.OrbitControls( camera );
		controls.addEventListener( 'change', render );

		scene = new THREE.Scene();
		// scene.fog = new THREE.FogExp2( 0xffffff, 0.00015 );

		// sides

		var light = new THREE.Color( 0xffffff );
		var shadow = new THREE.Color( 0x505050 );

		var matrix = new THREE.Matrix4();
		var vector = new THREE.Vector3();

		var pxGeometry = new THREE.PlaneGeometry( 100, 100 );
		pxGeometry.faces[ 0 ].materialIndex = 0;
		// pxGeometry.faces[ 0 ].vertexColors = [ light, shadow, shadow, light ];
		pxGeometry.applyMatrix( matrix.makeRotationY( Math.PI / 2 ) );
		pxGeometry.applyMatrix( matrix.makeTranslation( vector.set( 50, 0, 0 ) ) );

		var nxGeometry = new THREE.PlaneGeometry( 100, 100 );
		nxGeometry.faces[ 0 ].materialIndex = 1;
		// nxGeometry.faces[ 0 ].vertexColors = [ light, shadow, shadow, light ];
		nxGeometry.applyMatrix( matrix.makeRotationY( - Math.PI / 2 ) );
		nxGeometry.applyMatrix( matrix.makeTranslation( vector.set( -50, 0, 0 ) ) );

		var pyGeometry = new THREE.PlaneGeometry( 100, 100 );
		pyGeometry.faces[ 0 ].materialIndex = 2;
		// pyGeometry.faces[ 0 ].vertexColors = [ light, light, light, light ];
		pyGeometry.applyMatrix( matrix.makeRotationX( - Math.PI / 2 ) );
		pyGeometry.applyMatrix( matrix.makeTranslation( vector.set( 0, 50, 0 ) ) );

		var nyGeometry = new THREE.PlaneGeometry( 100, 100 );
		nyGeometry.faces[ 0 ].materialIndex = 3;
		// nyGeometry.faces[ 0 ].vertexColors = [ light, light, light, light ];
		nyGeometry.applyMatrix( matrix.makeRotationX( Math.PI / 2 ) );
		nyGeometry.applyMatrix( matrix.makeTranslation( vector.set( 0, -50, 0 ) ) );

		var pzGeometry = new THREE.PlaneGeometry( 100, 100 );
		pzGeometry.faces[ 0 ].materialIndex = 4;
		// pzGeometry.faces[ 0 ].vertexColors = [ light, shadow, shadow, light ];
		pzGeometry.applyMatrix( matrix.makeTranslation( vector.set( 0, 0, 50 ) ) );

		var nzGeometry = new THREE.PlaneGeometry( 100, 100 );
		nzGeometry.faces[ 0 ].materialIndex = 5;
		// nzGeometry.faces[ 0 ].vertexColors = [ light, shadow, shadow, light ];
		nzGeometry.applyMatrix( matrix.makeRotationY( Math.PI ) );
		nzGeometry.applyMatrix( matrix.makeTranslation( vector.set( 0, 0, -50 ) ) );

		planes = {
			'nx': pxGeometry,
			'px': nxGeometry,
			'ny': pyGeometry,
			'py': nyGeometry,
			'nz': pzGeometry,
			'pz': nzGeometry
		}

		// helper functions
		var encode = function (ex) {
			var size = 32;
			return ex[0] * size * size + ex[1] * size + ex[2];
		}

		var addArr = function (arr1, arr2) {
			var arr3 = [];
			var length = arr1.length < arr2.length ? arr1.length : arr2.length;

			for (var i = 0, ii = length; i < ii; i++) {
				arr3.push(arr1[i] + arr2[i]);
			}

			return arr3;
		}

		// make index table
		var example = models[0];
		var ex = 0;
		for (exx = example.length; ex < exx; ex++) {
			indices[encode(example[ex])] = example[ex];
		}

		// indices['size'] = ex;

		var dirs = {
			'px': [ 1, 0, 0],
			'nx': [-1, 0, 0],
			'py': [ 0, 1, 0],
			'ny': [ 0,-1, 0],
			'pz': [ 0, 0, 1],
			'nz': [ 0, 0,-1]
		};

		var VoxNode = function () {
			this.edges = {};
			this.index = 0;
		}

		// make spatial graph
		for (var i in indices) {
			var vn = new VoxNode();
			vn.data = indices[i];
			vn.index = i;

			for (var d in dirs) {
				var dir = dirs[d];
				var testIndex = encode(addArr(dir, vn.data));

				if (indices[testIndex]) {
					vn.edges[d] = testIndex;
				}
			}

			spatial[i] = vn;
		}

		// make geometry
		geometry = new THREE.Geometry();
		var dummy = new THREE.Mesh();

		var curplanes = {};

		for (var spn in spatial) { // spatial node
			var index = spatial[spn].index;
			var edges = spatial[spn].edges;
			var vox = indices[index];

			for (var ed in edges) {
				if (!curplanes[index + ed]) {
					dummy.position.x = vox[0] * 100;
					dummy.position.y = vox[1] * 100;
					dummy.position.z = vox[2] * 100;

					dummy.geometry = planes[ed];

					// console.log(index + ed, dummy);

					THREE.GeometryUtils.merge( geometry, dummy );

					curplanes[index + ed] = true;
				}
			}
		}


		camera.lookAt(THREE.GeometryUtils.center(geometry));

		var mats = [];

		for (var i = 0; i < 6; i++) {
			mats.push(makeTexturedMaterial('textures/testsq' + i + '.png'));
		}

		var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(mats));

		rotateAroundWorldAxis(mesh, new THREE.Vector3(-1,0,0), Math.PI / 2);

		scene.add( mesh );

		var ambientLight = new THREE.AmbientLight( 0xcccccc );
		scene.add( ambientLight );

		var directionalLight = new THREE.DirectionalLight( 0xffffff, 2 );
		directionalLight.position.set( 1, 1, 0.5 ).normalize();
		scene.add( directionalLight );

		renderer = new THREE.WebGLRenderer( { clearColor: 0xffffff } );
		renderer.setSize( window.innerWidth, window.innerHeight );

		container.innerHTML = "";

		container.appendChild( renderer.domElement );

		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '0px';
		container.appendChild( stats.domElement );

		//

		window.addEventListener( 'resize', onWindowResize, false );

	}
}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

	render();

	// controls.handleResize();

}

function loadTexture( path, callback ) {

	var image = new Image();

	image.onload = function () { callback(); };
	image.src = path;

	return image;

}

function generateHeight( width, height ) {

	var data = [], perlin = new ImprovedNoise(),
	size = width * height, quality = 2, z = Math.random() * 100;

	for ( var j = 0; j < 4; j ++ ) {

		if ( j == 0 ) for ( var i = 0; i < size; i ++ ) data[ i ] = 0;

		for ( var i = 0; i < size; i ++ ) {

			var x = i % width, y = ( i / width ) | 0;
			data[ i ] += perlin.noise( x / quality, y / quality, z ) * quality;

		}

		quality *= 4

	}
	return data;
}

function getY( x, z ) {

	return ( data[ x + z * worldWidth ] * 0.2 ) | 0;

}

function animate() {
	if (stop)
		return;

	stats.update();
	controls.update();

	requestAnimationFrame( animate );
}

function render() {

	renderer.render( scene, camera );

}

$(window).bind('load', function () {
	main();
});

var wat = ['webgl', 'wat r u doin', 'webgl', 'stahp'];
function stahp (i) {
	setTimeout(function () {
		if (!i)
			i = 0;
		if (i < 4) {
			console.log(wat[i]);
			return stahp(i+1);
		}
	}, 750);
	stop = true;
}

var renderAfterTexturesLoaded = _.after(6, function () {
	requestAnimationFrame(animate);
});

function makeTexturedMaterial (textureFile) {
	var texture = THREE.ImageUtils.loadTexture( textureFile, {}, function () {
			renderAfterTexturesLoaded();
		} );
		texture.magFilter = THREE.NearestFilter;
		texture.minFilter = THREE.LinearMipMapLinearFilter;

	var material = new THREE.MeshLambertMaterial( { map: texture, ambient: 0xbbbbbb, vertexColors: THREE.VertexColors } );

	return material;
}

// http://stackoverflow.com/questions/11060734/how-to-rotate-a-3d-object-on-axis-three-js
function rotateAroundWorldAxis( object, axis, radians ) {
	var rotationMatrix = new THREE.Matrix4();

	rotationMatrix.makeRotationAxis( axis.normalize(), radians );
	rotationMatrix.multiplySelf( object.matrix );                       // pre-multiply
	object.matrix = rotationMatrix;
	object.rotation.setEulerFromRotationMatrix( object.matrix );
}
