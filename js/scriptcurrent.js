//**********3D Environment Initialiation in threeJS*******
canvassizex = window.innerWidth;
canvassizey = window.innerHeight;
var obsdata = "";
var day = "";
var time = "";
var obsID = "";
var rotationini,
	rotationinix,
	rotationiniy,
	rotationiniz,
	aa,
	flagzoom = 0;

//Scene creation and camera setup with initialization
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(
	75,
	canvassizex / canvassizey,
	0.1,
	1000
);
cam_init_x = 0;
cam_init_y = 0;
cam_init_z = 10;
camera.position.set(cam_init_x, cam_init_y, cam_init_z);

const size = 1000;
const divisions = 1000;

//Renderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize(canvassizex, canvassizey);
document.getElementById("canvas").appendChild(renderer.domElement);

//controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);

controls.saveState();
controls.enableDamping = false;

controls.enableZoom = true;
controls.enablePan = false;
controls.zoomSpeed = 30;

controls.minDistance = 3;
controls.maxDistance = 20;
var gui = new dat.GUI({ autoPlace: false });
gui.domElement.id = "gui";
gui_container.appendChild(gui.domElement);
var is_grid = false;

//**********Controls Bar using dat.GUI*******

//Grid Toggle Button
var obj = {
	GridToggle: function () {
		if (!is_grid) {
			graticule1();
			is_grid = true;
		} else {
			removegrid();
			is_grid = false;
		}
	},
};
gui.add(obj, "GridToggle");

//Reset Button
var obj2 = {
	Reset: function () {
		var tween2 = new TWEEN.Tween(controls.target)
			.to({ x: 0, y: 0, z: 0 }, 500)
			.start();
		var tween = new TWEEN.Tween(camera)
			.to(
				{
					position: { x: cam_init_x, y: cam_init_y, z: cam_init_z },
					zoom: 1,
				},
				500
			)
			.start();

		controls.update();
	},
};
gui.add(obj2, "Reset");
controls.update();

// light
const light = new THREE.AmbientLight(0xffffff); // soft white light
scene.add(light);

camera.position.z = 10;

var radius = 100;
var radgrat = 99;
var latSegments = 18; // 10° increments
var longSegments = 36; // 10° increments

//main sphere

//Outer Background sphere
var geometry = new THREE.SphereBufferGeometry(
	radius,
	longSegments,
	latSegments
);
var sphereTexture = new THREE.TextureLoader().load("images/night3.webp");
sphereTexture.wrapS = sphereTexture.wrapT = THREE.MirroredRepeatWrapping;
var material = new THREE.MeshBasicMaterial({
	map: sphereTexture,
	color: 0xaaaaaa,
	wireframe: false,
});

var sphere1 = new THREE.Mesh(geometry, material);
sphere1.material.side = THREE.DoubleSide;
scene.add(sphere1);
function removegrid() {
	scene.remove(graticule);
}

//Function for generating the grid aka Graticule
function graticule1() {
	d3.json(
		"https://unpkg.com/world-atlas@1/world/50m.json",
		function (error, topology) {
			if (error) throw error;
			scene.add(
				(graticule = wireframe(
					graticule10(),
					new THREE.LineBasicMaterial({ color: 0x595959 })
				))
			);
			d3.timer(function (t) {
				renderer.render(scene, camera);
			});
		}
	);

	// Converts a point [longitude, latitude] in degrees to a THREE.Vector3.
	function vertex(point) {
		var lambda = (point[0] * Math.PI) / 180,
			phi = (point[1] * Math.PI) / 180,
			cosPhi = Math.cos(phi);
		return new THREE.Vector3(
			radgrat * cosPhi * Math.cos(lambda),
			radgrat * cosPhi * Math.sin(lambda),
			radgrat * Math.sin(phi)
		);
	}

	// Converts a GeoJSON MultiLineString in spherical coordinates to a THREE.LineSegments.
	function wireframe(multilinestring, material) {
		var geometry = new THREE.Geometry();
		multilinestring.coordinates.forEach(function (line) {
			d3.pairs(line.map(vertex), function (a, b) {
				geometry.vertices.push(a, b);
			});
		});
		return new THREE.LineSegments(geometry, material);
	}

	function graticule10() {
		var epsilon = 1e-6,
			x1 = 180,
			x0 = -x1,
			y1 = 80,
			y0 = -y1,
			dx = 10,
			dy = 10,
			X1 = 180,
			X0 = -X1,
			Y1 = 90,
			Y0 = -Y1,
			DX = 90,
			DY = 360,
			x = graticuleX(y0, y1, 2.5),
			y = graticuleY(x0, x1, 2.5),
			X = graticuleX(Y0, Y1, 2.5),
			Y = graticuleY(X0, X1, 2.5);

		function graticuleX(y0, y1, dy) {
			var y = d3.range(y0, y1 - epsilon, dy).concat(y1);
			return function (x) {
				return y.map(function (y) {
					return [x, y];
				});
			};
		}

		function graticuleY(x0, x1, dx) {
			var x = d3.range(x0, x1 - epsilon, dx).concat(x1);
			return function (y) {
				return x.map(function (x) {
					return [x, y];
				});
			};
		}

		return {
			type: "MultiLineString",
			coordinates: d3
				.range(Math.ceil(X0 / DX) * DX, X1, DX)
				.map(X)
				.concat(d3.range(Math.ceil(Y0 / DY) * DY, Y1, DY).map(Y))
				.concat(
					d3
						.range(Math.ceil(x0 / dx) * dx, x1, dx)
						.filter(function (x) {
							return Math.abs(x % DX) > epsilon;
						})
						.map(x)
				)
				.concat(
					d3
						.range(Math.ceil(y0 / dy) * dy, y1 + epsilon, dy)
						.filter(function (y) {
							return Math.abs(y % DY) > epsilon;
						})
						.map(y)
				),
		};
	}
}

//json parsing

const api_file = "/api/all";

async function getData() {
	const response = await fetch(api_file);
	data1 = await response.json();
	// data1 = data.data;
	callBackFunc(data1);
}
getData();

var stars = [];
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

//callback
function callBackFunc(data1) {
	//star
	stars = [];
		

	for (let i = 0; i < data1.data.length; i++) {
		let geometry = new THREE.SphereGeometry(0.5, 8, 8);
		const texturealpha = new THREE.TextureLoader().load("images/spark2.png");
		let material = new THREE.MeshBasicMaterial({
			color: 0xffffff,
			alphaMap: texturealpha,
			transparent: false,
		});

		const map1 = new THREE.TextureLoader().load("images/alpha.jpg");
		const material1 = new THREE.SpriteMaterial({
			map: map1,
			color: 0xc0c0c0,
			transparent: true,
			blending: THREE.AdditiveBlending,
		});

		material.transparent = false;
		let star = new THREE.Mesh(geometry, material);
		star.userData = data1.data[i];
		star.name = data1.data[i]; //name will go here
		star.position.setFromSphericalCoords(
			70,
			(data1.data[i].RA_degrees * 3.142) / 180, //THREE.Math.randFloat(0, 1.1),//RA radian
			(data1.data[i].DEC_degrees * 3.142) / 180 //THREE.Math.randFloat(-3.14, 3.14)//dec radian
		);
		star.material.side = THREE.DoubleSide;

		const map2 = new THREE.TextureLoader().load("images/glow1.png");
		if (data1.data[i]["Seen_by_Astrosat"]) {
			var material2 = new THREE.SpriteMaterial({
				map: map2,
				color: 0xfee227, //Cyan: 0x00FFFF
				transparent: true,
				blending: THREE.AdditiveBlending,
			});
		} else {
			var material2 = new THREE.SpriteMaterial({
				map: map2,
				color: 0x00ffff,
				transparent: true,
				blending: THREE.AdditiveBlending,
			});
		}

		const sprite = new THREE.Sprite(material2);
		sprite.scale.set(3, 3, 1.0);
		star.add(sprite);

		stars.push(star);
	}

	for (let j = 0; j < stars.length; j++) {
		scene.add(stars[j]);
	}

	animate();

	function getRandom() {
		var num = Math.floor(Math.random() * 10) + 1; // this will get a number between 1 and x;
		num *= Math.floor(Math.random() * 2) == 1 ? 1 : -1; // this will add minus sign in 50% of cases
		return num;
	}

	document
		.getElementsByTagName("canvas")[0]
		.addEventListener("click", onDocumentMouseDown);

	//function for mouse click to select objects

	function onDocumentMouseDown(event) {

		event.preventDefault();
		mouse.x = (event.offsetX / canvassizex) * 2 - 1;
		mouse.y = -(event.offsetY / canvassizey) * 2 + 1;
		raycaster.setFromCamera(mouse, camera);
		var intersects = raycaster.intersectObjects(stars);
		if (intersects.length > 0) {
				$("#new_paper").html(" ");
	$("#old_paper").html(" ");
			controls.saveState();
			flagzoom = 1;
			var tween = new TWEEN.Tween(camera).to({ zoom: 3 }, 500).start();
			var tween2 = new TWEEN.Tween(controls.target)
				.to(
					{
						x: intersects[0].object.position.x,
						y: intersects[0].object.position.y,
						z: intersects[0].object.position.z,
					},
					500
				)
				.start();
			rotationinix = camera.rotation.x;
			rotationiniy = camera.rotation.y;
			rotationiniz = camera.rotation.z;
			rotationini = camera.rotation;

			aa = intersects[0];
			controls.update();

			//Code segment for getting Data from API

			$("#intense").text(intersects[0].object.userData.V_magnitude.toFixed());
			$("#lat").text(
				intersects[0].object.userData.Galactic_latitude.toFixed(4)
			);
			$("#long").text(
				intersects[0].object.userData.Galactic_longitude.toFixed(4)
			);

			if (!(intersects[0].object.userData.Seen_by_Astrosat === 0)) {
				$("#det").text("Observed by AstroSat");
				$("#neon").text(intersects[0].object.userData.Astrosat_source_name);
				day = "";
				time = "";
				obsID = "";
				for (
					let obs = 0;
					obs < intersects[0].object.userData.observation.length;
					obs++
				) {
					day =
						day +
						"<li>" +
						intersects[0].object.userData.observation[obs].observation_date +
						"</li>";

					time =
						time +
						"<li>" +
						intersects[0].object.userData.observation[obs].observation_time +
						"</li>";

					obsID =
						obsID +
						"<li>" +
						intersects[0].object.userData.observation[obs].observation_ID +
						"</li>";
					$("#trgtid").text(
						intersects[0].object.userData.observation[obs].target_ID
					);
					$("#propid").text(
						intersects[0].object.userData.observation[obs].proposal_ID
					);
				}

				$("#obsday").html(day.slice(0, -1));
				$("#obstm").html(time.slice(0, -1));
				$("#obsid").html(obsID.slice(0, -1));
			} else {
				$("#det").text("");
				$("#neon").text(intersects[0].object.userData.Source_name);
			}

			$("#hms").text(
				" Degree: " + intersects[0].object.userData.RA_degrees.toFixed(4)
			);
			$("#dec").text(
				" Degree: " + intersects[0].object.userData.DEC_degrees.toFixed(4)
			);
			var ascii_url = intersects[0].object.userData.ascii_link;
			if (ascii_url === null) {
				$("#btn").css("display", "none");
			} else {
				$("#btn").attr("href", ascii_url);
				$("#btn").css("display", "inline");
			}
			var obser = intersects[0].object.userData.observation;
			if (obser.length === 0) {
				$("#observe").css("display", "none");
			} else {
				$("#observe").css("display", "block");
			}

			for (
				let j = 0;
				j < intersects[0].object.userData.old_papers.length;
				j++
			) {
				const biblink = intersects[0].object.userData.old_papers[j].url;
				const title = intersects[0].object.userData.old_papers[j].title;
				const author = intersects[0].object.userData.old_papers[j].author;

				 old_paper =
					'<li id="post"><a id="link" href="' +
					biblink +
					'"  target="_blank">' +
					title +
					"</a></li>";

				if (title == null || title.length == 0) {
					 old_paper =
						'<li id="post"><p id="link" href="' +
						biblink +
						'"  target="_blank">' +
						author +
						"</p></li>";
				}

				$("#old_paper").append(old_paper);
			}
			for (
				let k = 0;
				k < intersects[0].object.userData.new_papers.length;
				k++
			) {
				const biblink_new = intersects[0].object.userData.new_papers[k].url;
				const title_new = intersects[0].object.userData.new_papers[k].title;
				const author_new = intersects[0].object.userData.new_papers[k].author;

				 new_paper =
					'<li id="post"><a id="link" href="' +
					biblink_new +
					'"  target="_blank">' +
					intersects[0].object.userData.new_papers[k].title +
					"</a></li>";
				if (title_new == null || title_new.length == 0) {
					 new_paper =
						'<li id="post"><p id="link" href="' +
						biblink_new +
						'"  target="_blank">' +
						author_new +
						"</p></li>";
				}

				$("#new_paper").append(new_paper);
			}

			animate();
		}

		//Function for using tooltip to hover

		window.addEventListener("mousemove", Tooltip);
		function Tooltip(event) {
			event.preventDefault();
			mouse.x = (event.offsetX / canvassizex) * 2 - 1;
			mouse.y = -(event.offsetY / canvassizey) * 2 + 1;
			raycaster.setFromCamera(mouse, camera);
			var intersects = raycaster.intersectObjects(stars);
			if (intersects.length > 0) {
				//get a link from the userData object

				$("#tooltip").css("display", "block");
				$("#tooltip").css("top", event.clientY + 5 + "px");
				$("#tooltip").css("left", event.clientX + 5 + "px");
				if (!(intersects[0].object.userData.Seen_by_Astrosat === 0)) {
					$("#tooltip").text(
						intersects[0].object.userData.Astrosat_source_name
					);
				} else {
					$("#tooltip").text(intersects[0].object.userData.Source_name);
				}
			} else {
				$("#tooltip").css("display", "none");
			}
		}

		//Enabling double click to zoom out
		document.addEventListener("dblclick", ondblclick, false);

		function ondblclick(event) {
			var intersects1 = raycaster.intersectObject(sphere1);
			if (intersects1.length > 0) {
				if (flagzoom == 1) {
					var factor = -0.1;
					var tween2 = new TWEEN.Tween(controls.target)
						.to({ x: 0, y: 0, z: 0 }, 500)
						.start();
					var tween = new TWEEN.Tween(camera)
						.to(
							{
								zoom: 1,
								position: {
									x: aa.object.position.x * factor,
									y: aa.object.position.y * factor,
									z: aa.object.position.z * factor,
								},
							},
							500
						)
						.start();
					camera.rotation = rotationini;

					controls.update();
					animate();
					flagzoom = 0;
				}
			}
		}
	}
}

function animate() {
	camera.updateProjectionMatrix();
	controls.update();
	requestAnimationFrame(animate);
	TWEEN.update();
	renderer.render(scene, camera);
}

function editDistance(string1, string2) {
	const current = [];

	for (let row = 0, temp, next; row < string2.length; ++row) {
		temp = row;

		for (let column = 0; column < string1.length; ++column) {
			next = row > 0 ? current[column] : column + 1;

			current[column] =
				string2[row] === string1[column]
					? temp
					: Math.min(
							temp,
							row > 0 ? current[column] : column + 1,
							row > 0 && column > 0 ? current[column - 1] : row + 1
					  ) + 1;

			temp = next;
		}
	}

	return current.length === 0
		? Math.max(string1.length, string2.length)
		: current[current.length - 1];
}

var a, b;

function search() {
	// Declare variables
	console.log("start");
	//    const response = await fetch(api_file);
	//	data3 = await response.json();
	var input, filter, ul, li, i, txtValue;
	input = document.getElementById("myInput");
	filter = input.value.toUpperCase();
	var integer, string;
	integer = 1000;
	// Loop through all list items, and hide those who don't match the search query
	for (i = 0; i < stars.length; i++) {
		a = stars[i].userData.Source_name.toUpperCase();
		b = stars[i].userData.Astrosat_source_name.toUpperCase();
		if (editDistance(a, filter) < integer) {
			integer = editDistance(a, filter);
			string = i;
		}
		if (editDistance(b, filter) < integer) {
			integer = editDistance(b, filter);
			string = i;
		}
	}
	console.log(string);
	onsearch(string);
}

function onsearch(i) {
	$("#new_paper").html(" ");
	$("#old_paper").html(" ");
	controls.saveState();
	flagzoom = 1;
	var tween = new TWEEN.Tween(camera).to({ zoom: 3 }, 500).start();
	var tween2 = new TWEEN.Tween(controls.target)
		.to(
			{
				x: stars[i].position.x,
				y: stars[i].position.y,
				z: stars[i].position.z,
			},
			500
		)
		.start();
	rotationinix = camera.rotation.x;
	rotationiniy = camera.rotation.y;
	rotationiniz = camera.rotation.z;
	rotationini = camera.rotation;
	// How far you can orbit vertically, upper and lower limits.
	// Range is 0 to Math.PI radians.
	// controls.minPolarAngle = -Math.PI/6; // radians
	// controls.maxPolarAngle = Math.PI/6; // radians
	// How far you can orbit horizontally, upper and lower limits.
	// If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
	// controls.minAzimuthAngle = -Math.PI/6; // radians
	// controls.maxAzimuthAngle = Math.PI/6; // radians

	var tween = new TWEEN.Tween(camera).to({ zoom: 3 }, 500).start();
	var tween2 = new TWEEN.Tween(controls.target)
		.to(
			{
				x: stars[i].position.x,
				y: stars[i].position.y,
				z: stars[i].position.z,
			},
			500
		)
		.start();
	rotationinix = camera.rotation.x;
	rotationiniy = camera.rotation.y;
	rotationiniz = camera.rotation.z;
	rotationini = camera.rotation;
	aa = stars[i];
	// controls.target.set(
	// x:stars[i].position.x,
	// y:stars[i].position.y,
	// z:stars[i].position.z
	controls.update();
	// );

	// $("#source").text(stars[i].userData.Source_name);
	$("#intense").text(stars[i].userData.V_magnitude.toFixed());
	$("#lat").text(stars[i].userData.Galactic_latitude.toFixed(4));
	$("#long").text(stars[i].userData.Galactic_longitude.toFixed(4));

	//$("#det").text(stars[i].userData.Seen_by_Astrosat);
	if (!(stars[i].userData.Seen_by_Astrosat === 0)) {
		$("#det").text("Observed by AstroSat");
		$("#neon").text(stars[i].userData.Astrosat_source_name);
		day = "";
		time = "";
		obsID = "";
		for (let obs = 0; obs < stars[i].userData.observation.length; obs++) {
			day =
				day +
				"<li>" +
				stars[i].userData.observation[obs].observation_date +
				"</li>";

			time =
				time +
				"<li>" +
				stars[i].userData.observation[obs].observation_time +
				"</li>";

			obsID =
				obsID +
				"<li>" +
				stars[i].userData.observation[obs].observation_ID +
				"</li>";
			$("#trgtid").text(stars[i].userData.observation[obs].target_ID);
			$("#propid").text(stars[i].userData.observation[obs].proposal_ID);
		}

		$("#obsday").html(day.slice(0, -1));
		$("#obstm").html(time.slice(0, -1));
		$("#obsid").html(obsID.slice(0, -1));
	} else {
		$("#det").text("");
		$("#neon").text(stars[i].userData.Source_name);
	}

	$("#hms").text(" Degree: " + stars[i].userData.RA_degrees.toFixed(4));
	$("#dec").text(" Degree: " + stars[i].userData.DEC_degrees.toFixed(4));
	var ascii_url = stars[i].userData.ascii_link;
	if (ascii_url === null) {
		$("#btn").css("display", "none");
	} else {
		$("#btn").attr("href", ascii_url);
		$("#btn").css("display", "inline");
	}
	var obser = stars[i].userData.observation;
	if (obser.length === 0) {
		$("#observe").css("display", "none");
	} else {
		$("#observe").css("display", "block");
	}
	// $("button").click(function(){
	// $("p").append("<b>Appended text</b>");
	// });
	//document.getElementById("link").innerHTML = text;

	for (let j = 0; j < stars[i].userData.old_papers.length; j++) {
		const biblink = stars[i].userData.old_papers[j].url;
		const title = stars[i].userData.old_papers[j].title;
		const author = stars[i].userData.old_papers[j].author;

		 old_paper =
			'<li id="post"><a id="link" href="' +
			biblink +
			'" target="_blank">' +
			title +
			"</a></li>";

		if (title == null || title.length == 0) {
			 old_paper =
				'<li id="post"><p id="link" href="' +
				biblink +
				'" target="_blank">' +
				author +
				"</p></li>";
		}

		$("#old_paper").append(old_paper);
	}
	for (let k = 0; k < stars[i].userData.new_papers.length; k++) {
		const biblink_new = stars[i].userData.new_papers[k].url;
		const title_new = stars[i].userData.new_papers[k].title;
		const author_new = stars[i].userData.new_papers[k].author;

		var new_paper =
			'<li id="post"><a id="link" href="' +
			biblink_new +
			'" target="_blank">' +
			stars[i].userData.new_papers[k].title +
			"</a></li>";
		if (title_new == null || title_new.length == 0) {
			var new_paper =
				'<li id="post"><p id="link" href="' +
				biblink_new +
				'" target="_blank">' +
				author_new +
				"</p></li>";
		}

		$("#new_paper").append(new_paper);
	}

	animate();
}
