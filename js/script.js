let renderer, camera, planet, moon, sphereBg, terrainGeometry, timeout_Debounce;
let frame = count = t = 0;
let cameraDx = 0.05;
let lineTotal = 100;

let container = document.getElementById("canvas_container");
let linesGeometry = new THREE.BufferGeometry();
linesGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6 * lineTotal), 3));
linesGeometry.setAttribute("velocity", new THREE.BufferAttribute(new Float32Array(2 * lineTotal), 1));

let l_positionAttr = linesGeometry.getAttribute("position");
let l_vertex_Array = linesGeometry.getAttribute("position").array;
let l_velocity_Array = linesGeometry.getAttribute("velocity").array;

init();
animate();

function init() {
	scene = new THREE.Scene();
	scene.background = new THREE.Color("#000000");
	scene.fog = new THREE.Fog("#3c1e02", 0.5, 50);

	camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.01, 1000)
	camera.position.set(0, 1, 32)

	pointLight1 = new THREE.PointLight("#ffffff", 1, 0);
	pointLight1.position.set(0, 30, 30);
	scene.add(pointLight1);

	renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
	renderer.setSize(container.clientWidth, container.clientHeight);
	renderer.setPixelRatio(window.devicePixelRatio);
	container.appendChild(renderer.domElement);

	const loader = new THREE.TextureLoader();

	// Planet
	let temp = THREE.MathUtils.randInt(0, 3);
	var texturePlanet = null
	switch (temp) {
		case 0:
			texturePlanet = loader.load('https://images.unsplash.com/photo-1629788959554-ef4502a45e7d?auto=compress&fit=crop&w=750');
			break;
		case 1:
			texturePlanet = loader.load('https://images.unsplash.com/photo-1542407424724-5426773d65a5?auto=compress&fit=crop&w=750');
			break;
		case 2:
			texturePlanet = loader.load('https://images.unsplash.com/photo-1530982011887-3cc11cc85693?auto=compress&fit=crop&w=750');
			break;
		case 3:
			texturePlanet = loader.load('https://images.unsplash.com/photo-1596125889454-ffd2999b4ab5?auto=compress&fit=crop&w=750');
			break;
	}

	texturePlanet.anisotropy = 16;
	const planetGeometry = new THREE.SphereBufferGeometry(10, 50, 50);
	const planetMaterial = new THREE.MeshLambertMaterial({map: texturePlanet, fog: false});
	planet = new THREE.Mesh(planetGeometry, planetMaterial);
	planet.position.set(0, 8, -30);
	scene.add(planet);

	//Moon
	const textureMoon = loader.load('https://images.unsplash.com/photo-1632835837413-890dd1af57d2?auto=compress&fit=crop&w=500');
	textureMoon.anisotropy = 16;
	let moonGeometry = new THREE.SphereBufferGeometry(2, 32, 32);
	let moonMaterial = new THREE.MeshPhongMaterial({map: textureMoon, fog: false});
	moon = new THREE.Mesh(moonGeometry, moonMaterial);
	moon.position.set(0, 8, 0);
	scene.add(moon);

	// Sphere Background 
	const textureSphereBg = loader.load('https://i.ibb.co/JCsHJpp/stars2-qx9prz.jpg');
	textureSphereBg.anisotropy = 16;
	const geometrySphereBg = new THREE.SphereBufferGeometry(150, 32, 32);
	const materialSphereBg = new THREE.MeshBasicMaterial({side: THREE.BackSide,	map: textureSphereBg, fog: false});
	sphereBg = new THREE.Mesh(geometrySphereBg, materialSphereBg);
	sphereBg.position.set(0, 50, 0);
	scene.add(sphereBg);

	// Terrain
	const textureTerrain = loader.load();
	textureTerrain.rotation = THREE.MathUtils.degToRad(5);
	terrainGeometry = new THREE.PlaneBufferGeometry(70, 70, 20, 20);
	const terrainMaterial = new THREE.MeshBasicMaterial({map: textureTerrain, fog: true	});
	terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
	terrain.rotation.x = -0.47 * Math.PI;
	terrain.rotation.z = THREE.Math.degToRad(90);
	scene.add(terrain);

	let t_vertex_Array = terrainGeometry.getAttribute("position").array;
	terrainGeometry.getAttribute("position").setUsage(THREE.DynamicDrawUsage);

	terrainGeometry.setAttribute("myZ", new THREE.BufferAttribute(new Float32Array(t_vertex_Array.length / 3), 1));
	let t_myZ_Array = terrainGeometry.getAttribute("myZ").array;

	for (let i = 0; i < t_vertex_Array.length; i++) {
		t_myZ_Array[i] = THREE.MathUtils.randInt(0, 3);
	}

	//Terain Lines
	const terrain_line = new THREE.LineSegments(
		terrainGeometry,
		new THREE.LineBasicMaterial({color: "#fff", fog: false})
	);
	terrain_line.rotation.x = -0.47 * Math.PI;
	terrain_line.rotation.z = THREE.Math.degToRad(90);
	scene.add(terrain_line);

	stars()
}

function stars() {
	for (let i = 0; i < lineTotal; i++) {
		let x = THREE.MathUtils.randInt(-100, 100);
		let y = THREE.MathUtils.randInt(10, 40);
		if (x < 7 && x > -7 && y < 20) x += 14;
		let z = THREE.MathUtils.randInt(0, -300);

		l_vertex_Array[6 * i + 0] = l_vertex_Array[6 * i + 3] = x;
		l_vertex_Array[6 * i + 1] = l_vertex_Array[6 * i + 4] = y;
		l_vertex_Array[6 * i + 2] = l_vertex_Array[6 * i + 5] = z;

		l_velocity_Array[2 * i] = l_velocity_Array[2 * i + 1] = 0;
	}
	let starsMaterial = new THREE.LineBasicMaterial({color: "#ffffff", transparent: true, opacity: 0.5, fog: false});
	let lines = new THREE.LineSegments(linesGeometry, starsMaterial);
	linesGeometry.getAttribute("position").setUsage(THREE.DynamicDrawUsage);
	scene.add(lines);
}

function animate() {
	planet.rotation.y += 0.004;
	sphereBg.rotation.x += 0.002;
	sphereBg.rotation.y += 0.002;
	sphereBg.rotation.z += 0.002;

	moon.rotation.y -= 0.017;
	moon.rotation.x -= 0.027;
	moon.position.x = 15 * Math.cos(t) + 0;
	moon.position.z = 20 * Math.sin(t) - 35;
	t += 0.015;


	let t_vertex_Array = terrainGeometry.getAttribute("position").array;
	let t_myZ_Array = terrainGeometry.getAttribute("myZ").array;

	for (let i = 0; i < t_vertex_Array.length; i++) {
		if (i >= 210 && i <= 250) t_vertex_Array[i * 3 + 2] = 0;
		else {
			t_vertex_Array[i * 3 + 2] = Math.sin((i + count * 0.0002)) * (t_myZ_Array[i] - (t_myZ_Array[i] * 0.2));
			count += 0.1;
		}
	}

	//   Stars Animation  
	for (let i = 0; i < lineTotal; i++) {
		l_velocity_Array[2 * i] += 0.0049;
		l_velocity_Array[2 * i + 1] += 0.005;

		l_vertex_Array[6 * i + 2] += l_velocity_Array[2 * i];
		l_vertex_Array[6 * i + 5] += l_velocity_Array[2 * i + 1];

		if (l_vertex_Array[6 * i + 2] > 50) {
			l_vertex_Array[6 * i + 2] = l_vertex_Array[6 * i + 5] = THREE.MathUtils.randInt(-200, 10);
			l_velocity_Array[2 * i] = 0;
			l_velocity_Array[2 * i + 1] = 0;
		}
	}

	//Camera Movement
	camera.position.x += cameraDx;
	camera.position.y = -1.2 * (1 - Math.abs(frame / 2000 - 0.5) / 0.5);
	camera.lookAt(0, 0, 0);
	frame += 8;
	if (frame > 2000) frame = 0;
	if (camera.position.x > 18) cameraDx = -cameraDx;
	if (camera.position.x < -18) cameraDx = Math.abs(cameraDx);


	l_positionAttr.needsUpdate = true;
	terrainGeometry.attributes.position.needsUpdate = true;
	renderer.render(scene, camera);
	requestAnimationFrame(animate);
}

/*     Resize     */
window.addEventListener("resize", () => {
	clearTimeout(timeout_Debounce);
	timeout_Debounce = setTimeout(onWindowResize, 80);
});

function onWindowResize() {
	camera.aspect = container.clientWidth / container.clientHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(container.clientWidth, container.clientHeight);
}

let fullscreen;
let fsEnter = document.getElementById('fullscreen');
fsEnter.addEventListener('click', function (e) {
	e.preventDefault();
	if (!fullscreen) {
		fullscreen = true;
		document.documentElement.requestFullscreen();
		fsEnter.innerHTML = "Exit Fullscreen";
	} else {
		fullscreen = false;
		document.exitFullscreen();
		fsEnter.innerHTML = "Go Fullscreen";
	}
});