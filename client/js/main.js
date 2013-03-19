var fogExp2 = true;

var container, stats;

var camera, controls, scene, renderer, projector;

var mesh, mat;

var clock;

var mouse = { x: -2.0, y: -2.0 }, INTERSECTED;

var stop = false;

var indices = {},
	faceIndices = [],
	spatial = {},
	colors = [],
	uvs = [];

function main () {
	if (!Detector.webgl) {
		Detector.addGetWebGLMessage();
		document.getElementById('nb').innerHTML = "";
	}

	clock = new THREE.Clock();
	init();

	function init() {

		container = document.getElementById( 'nb' );

		camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 20000 );
		camera.position.z = 2500;

		controls = new THREE.OrbitControls( camera );
		// controls.addEventListener( 'change', render );

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
		pxGeometry.applyMatrix( matrix.makeTranslation( vector.set( 0, 0, 50 ) ) );
		pxGeometry.applyMatrix( matrix.makeRotationY( Math.PI / 2 ) );

		var nxGeometry = new THREE.PlaneGeometry( 100, 100 );
		nxGeometry.faces[ 0 ].materialIndex = 1;
		// nxGeometry.faces[ 0 ].vertexColors = [ light, shadow, shadow, light ];
		nxGeometry.applyMatrix( matrix.makeTranslation( vector.set( 0, 0, 50 ) ) );
		nxGeometry.applyMatrix( matrix.makeRotationY( -Math.PI / 2 ) );

		var pyGeometry = new THREE.PlaneGeometry( 100, 100 );
		pyGeometry.faces[ 0 ].materialIndex = 2;
		// pyGeometry.faces[ 0 ].vertexColors = [ light, light, light, light ];
		pyGeometry.applyMatrix( matrix.makeTranslation( vector.set( 0, 0, 50 ) ) );
		pyGeometry.applyMatrix( matrix.makeRotationX( -Math.PI / 2 ) );

		var nyGeometry = new THREE.PlaneGeometry( 100, 100 );
		nyGeometry.faces[ 0 ].materialIndex = 3;
		// nyGeometry.faces[ 0 ].vertexColors = [ light, light, light, light ];
		nyGeometry.applyMatrix( matrix.makeTranslation( vector.set( 0, 0, 50 ) ) );
		nyGeometry.applyMatrix( matrix.makeRotationX( Math.PI / 2 ) );

		var pzGeometry = new THREE.PlaneGeometry( 100, 100 );
		pzGeometry.faces[ 0 ].materialIndex = 4;
		// pzGeometry.faces[ 0 ].vertexColors = [ light, shadow, shadow, light ];
		pzGeometry.applyMatrix( matrix.makeTranslation( vector.set( 0, 0, 50 ) ) );
		pzGeometry.applyMatrix( matrix.makeRotationY( Math.PI ) );

		var nzGeometry = new THREE.PlaneGeometry( 100, 100 );
		nzGeometry.faces[ 0 ].materialIndex = 5;
		// nzGeometry.faces[ 0 ].vertexColors = [ light, shadow, shadow, light ];
		nzGeometry.applyMatrix( matrix.makeTranslation( vector.set( 0, 0, 50 ) ) );
		nzGeometry.applyMatrix( matrix.makeRotationZ( -Math.PI / 2) );

		planes = {
			'px': pxGeometry,
			'nx': nxGeometry,
			'py': pyGeometry,
			'ny': nyGeometry,
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

		// make color swatch index
		colors = generateColors();
		var colortex = document.createElement('canvas');
		colortex.width = colortex.height = 256;
		var ctx = colortex.getContext('2d');

		// make index table
		var date0 = new Date();

		var example = models[1];
		var ex = 0;
		var nodeindex = 0;
		for (exx = example.length; ex < exx; ex++) {
			nodeindex = encode(example[ex]);
			indices[nodeindex] = example[ex];
		}

		var dirs = {
			'px': [ 1, 0, 0],
			'nx': [-1, 0, 0],
			'py': [ 0, 1, 0],
			'ny': [ 0,-1, 0],
			'pz': [ 0, 0, 1],
			'nz': [ 0, 0,-1]
		};

		geometry = new THREE.Geometry();
		dummy = new THREE.Mesh();
		var texsize = 256;

		var drawPlane = function (index, dir) {
			var vox = indices[index];

			// make texture
			var color = colors[vox[3]],
				cx = index % texsize / 2,
				cy = index / texsize | 0;
			// console.log(index, cx, cy);
			ctx.fillStyle = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ', 1.0)';
			ctx.fillRect(127 + cx, cy, 1, 1);

			dummy.position.x = vox[0] * 100;
			dummy.position.y = vox[1] * 100;
			dummy.position.z = vox[2] * 100;

			dummy.geometry = planes[dir];

			var pxsize = 1 / texsize, // uv pixel size
				uvoffsx = cx / texsize, // uv offset x/y
				uvoffsy = cy / texsize;

			uvs.push([
				new THREE.Vector2(uvoffsx, uvoffsy + pxsize),
				new THREE.Vector2(uvoffsx, uvoffsy),
				new THREE.Vector2(uvoffsx + pxsize, uvoffsy),
				new THREE.Vector2(uvoffsx + pxsize, uvoffsx + pxsize)
			]); // uvs

		//	dummy.geometry.verticesNeedUpdate = true;
		//	dummy.geometry.elementsNeedUpdate = true;
		//	dummy.geometry.morphTargetsNeedUpdate = true;
		//	dummy.geometry.uvsNeedUpdate = true;
		//	dummy.geometry.normalsNeedUpdate = true;
		//	dummy.geometry.colorsNeedUpdate = true;
		//	dummy.geometry.tangentsNeedUpdate = true;

			// add two faceindices for interaction, 1 plane -> 2 tris
			faceIndices.push(index);
			// faceIndices.push(index);

			THREE.GeometryUtils.merge(geometry, dummy);
		}

		var searchRuns = 0;
		var searched = {};
		var curCallStack = 0;
		var maxCallStack = 0;

		var spatialSearch = function (index) {
			searchRuns++;

			if (searched[index]) {
				curCallStack = 0;
				return;
			}
			else {
				searched[index] = true;
			}

			for (var dir in dirs) {
				var dirVec = dirs[dir];
				var testIndex = encode(addArr(dirVec, indices[index]));

				if (indices[testIndex]) {
					// for debugging purposes, we'd like to know how far down our recursion goes
					curCallStack++;
					maxCallStack = curCallStack > maxCallStack ? curCallStack : maxCallStack;

					// go on to search others
					spatialSearch(testIndex);
				}
				else {
					curCallStack = 0;
					drawPlane(index, dir);
				}
			}
		}

		spatialSearch(nodeindex);

		// $('#nb').before(colortex); // texture testing

		console.log('searches run:', searchRuns, 'number of voxels searched:', _.size(searched), 'max call stack:', maxCallStack);

		var date1 = new Date();

		console.log('search took ' + (date1 - date0) + ' ms to run.');

		//

		camera.lookAt(THREE.GeometryUtils.center(geometry));

		var mats = [];

		for (var i = 0; i < 6; i++) {
			mats.push(makeTexturedMaterial('textures/testsq' + i + '.png'));
			// mats[i].side = THREE.DoubleSide;
		}

		// var texture = new THREE.Texture(colortex);
		// console.log(texture);
		// var colormat = new THREE.MeshBasicMaterial({ map: texture });
		// var material = new THREE.MeshLambertMaterial( { map: texture, ambient: 0xbbbbbb, vertexColors: THREE.VertexColors } );

		geometry.computeFaceNormals();
		geometry.faceVertexUvs[0] = uvs;
		geometry.uvsNeedUpdate = true;

		var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial());
		console.log(mesh);

		rotateAroundWorldAxis(mesh, new THREE.Vector3(-1,0,0), Math.PI / 2);

		scene.add( mesh );

		var ambientLight = new THREE.AmbientLight( 0xcccccc );
		scene.add( ambientLight );

		var directionalLight = new THREE.DirectionalLight( 0xffffff, 2 );
		directionalLight.position.set( 1, 1, 0.5 ).normalize();
		scene.add( directionalLight );

		projector = new THREE.Projector();

		renderer = new THREE.WebGLRenderer( { clearColor: 0xffffff } );
		renderer.setSize( window.innerWidth, window.innerHeight );

		container.innerHTML = "";

		container.appendChild( renderer.domElement );

		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '0px';
		container.appendChild( stats.domElement );

		// events
		document.addEventListener( 'mousemove', onDocumentMouseMove, false );
		window.addEventListener( 'resize', onWindowResize, false );

		// renderAfterTexturesLoaded(animate);
	}
}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

	render();
}

function onDocumentMouseMove( event ) {
	event.preventDefault();

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function animate() {
	if (stop)
		return;

	render();

	stats.update();
	controls.update();

	requestAnimationFrame( animate );
}

function render() {
	// find intersections
	var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
	projector.unprojectVector( vector, camera );
	var raycaster = new THREE.Raycaster( camera.position, vector.subSelf( camera.position ).normalize() );
	var intersects = raycaster.intersectObjects( scene.children );

	if ( intersects.length > 0 ) {
		var voxInfo = indices[faceIndices[intersects[0].faceIndex]];
		console.log('faceIndex:', intersects[0].faceIndex, 'x:', voxInfo[0], 'y:', voxInfo[1], 'z:', voxInfo[2], 'color:', voxInfo[3], intersects[0]);
	} else {
		// no intersection
	}

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

	var material = new THREE.MeshLambertMaterial( { map: texture, ambient: 0xbbbbbb } ); // , vertexColors: THREE.VertexColors

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

function generateColors () {
	var swatch = [],
		color = [],
		x = 0, y = 0, z = 0;
	
	for (z = 0; z < 32; z++) {
		for (y = 0; y < 32; y++) {
			for (x = 31; x >= 0; x--) {
				color = [
					(z + 1) * 8,
					(y + 1) * 8,
					256 - (x + 1) * 8
				];
				
				swatch.push(color);
			}
		}
	}

	return swatch;
};