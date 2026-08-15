var SPEED = 0.004;
var CAMERA_LAG = 0.9;
var COLLISION = 1.1;
var BOUNCE = 0.7;
var mapscale = 5;
var VR = false;
var BOUNCE_CORRECT = 0.01;
var WALL_SIZE = 1.2;
var MOUNTAIN_DIST = 250;
var OOB_DIST = 200;
var LAPS = 5;

// Exact OG Track String
var OG_TRACK_CODE = "1,5/0,7 0,7/-1,8 -1,8/-3,9 -3,9/-7,9 -7,9/-9,8 -9,8/-10,7 -10,7/-11,5 -6,7/-4,7 -4,7/-2,6 -2,6/-1,4 -6,7/-8,6 -8,6/-9,4 -1,4/-1,0 1,0/1,5 -11,5/-11,0 -11,0/-10,-1 -10,-1/-8,-1 -8,-1/-7,0 -7,0/-7,2 -9,3/-8,4 -8,4/-6,4 -6,4/-5,3 -5,3/-5,1 -9,1/-9,4 -5,3/-4,4 -4,4/-2,4 -2,4/-1,3 -7,0/-6,-1 -6,-1/-4,-1 -4,-1/-3,0 -3,0/-3,2 -1,0/-1,-2 -1,-2/0,-4 0,-4/2,-5 2,-5/4,-5 4,-5/6,-4 6,-4/7,-2 -3,0/-3,-3 -3,-3/-2,-5 -2,-5/-1,-6 -1,-6/1,-7 1,-7/5,-7 5,-7/7,-6 7,-6/8,-5 8,-5/9,-3 9,-3/9,2 9,2/8,4 8,4/6,5 6,5/4,5 4,5/2,4 2,4/1,2 7,-2/7,2 7,2/6,3 6,3/4,3 4,3/3,2 4,-3/2,-3 2,-3/1,-2 1,-2/1,0 4,-3/5,-2 5,-2/5,1 3,2/3,-1 |-1,3/1,3 6,-4/7,-6 |-7,5 -5,6 -4,5 2,6 1,8 3,9 4,6 3,7 -3,10 -4,12 -10,11 -12,8 -14,8 -12,6 -7,10 -12,2 -15,3 -13,-1 -10,-4 -8,-2 -6,-4 -4,-3 -11,-2 -8,-3 -4,-5 -3,-6 -5,-2 0,-8 -2,-8 -4,-8 -5,-6 -3,-10 2,-9 4,-8 5,-10 6,-8 10,-7 8,-7 9,-11 9,-5 15,-4 11,-2 11,-1 10,3 16,2 12,1 8,6 7,9 6,6 -8,-7 -13,-7 -13,-4 -15,-4 -17,0 |1,3,6/22 0,3,8/55 -2,3,9/77 -8,3,9/115 -10,3,8/148 -11,3,6/166 -8,3,4/-86 -7,3,4/-83 -6,3,4/-90 -10,3,-1/-83 -9,3,-1/-88 -8,3,-1/-90 -6,3,-1/-89 -5,3,-1/-89 -4,3,-1/-89 -4,3,4/-90 -3,3,4/-90 -2,3,4/265 -3,3,-4/194 -2,3,-6/218 0,3,-7/262 6,3,-7/-69 8,3,-6/-42 9,3,-4/-16 9,3,4/40 8,3,5/70 2,3,5/135 3,3,6/122 |";

var serverList = [
    {
        apiKey: "AIzaSyBhBjB9cD8IDFarhBMUoG_jhL_Gl277ZG8",
        authDomain: "racing-game-67477.firebaseapp.com",
        databaseURL: "https://racing-game-67477-default-rtdb.firebaseio.com",
        projectId: "racing-game-67477",
        storageBucket: "racing-game-67477.firebasestorage.app",
        messagingSenderId: "48596697348",
        appId: "1:48596697348:web:897b9f78e511bc2f635051"
    }
];

var database = null;

function initFirebase() {
    if (database) return;
    try {
        var app;
        var existingApp = firebase.apps && firebase.apps.find(function(a) { return a.name === 'server0'; });
        if (existingApp) {
            app = existingApp;
        } else if (typeof firebase !== 'undefined') {
            app = firebase.initializeApp(serverList[0], "server0");
        }
        if (app) {
            database = app.database();
            app.auth().signInAnonymously().catch(function(e){ console.warn(e); });
        }
    } catch(e) {
        console.error("Firebase load fallback:", e);
    }
}
initFirebase();

// Menu Transitions
setTimeout(function() { if (document.getElementById("title")) document.getElementById("title").style.transform = "none"; }, 500);
setTimeout(function() { if (document.getElementsByClassName("menuitem")[0]) document.getElementsByClassName("menuitem")[0].style.transform = "none"; }, 1000);
setTimeout(function() { if (document.getElementsByClassName("menuitem")[1]) document.getElementsByClassName("menuitem")[1].style.transform = "none"; }, 1200);
setTimeout(function() { if (document.getElementsByClassName("menuitem")[2]) document.getElementsByClassName("menuitem")[2].style.transform = "none"; }, 1400);

function forceScroll() {
    requestAnimationFrame(forceScroll);
    window.scrollTo(0, 0);
}
forceScroll();

var camera, renderer, scene;
scene = new THREE.Scene();
renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

var element = renderer.domElement;
var name = "Nerd with No Name", code = "", players = {}, me = {}, gameStarted = false, gameSortaStarted = false, left = false, right = false, lap;
var color = Math.floor(Math.random() * 360);
var f = document.getElementById("fore");
var s = document.getElementById("slider");
var wallSegments = []; // Collision checking list

var updateColor = function() {
    if (s) {
        s.style.marginLeft = color / 360 * 80 + "vw";
        s.style.backgroundColor = "hsl(" + color + ", 100%, 50%)";
    }
    document.body.style.backgroundColor = "hsl(" + color + ", 50%, 50%)";
}
updateColor();

var menu2 = function() {
    if (document.getElementById("name") && document.getElementById("name").value !== "") {
        name = document.getElementById("name").value;
    }
    if (f) {
        f.style.transform = "translate3d(0, -100vh, 0)";
        setTimeout(function() {
            f.innerHTML = "<div class='menuitem title button' id='host' onclick='host()'>Host a game</div><div class='menuitem title button' id='join' onclick='joinGame()'>Join a game</div>";
            f.style.transform = "none";
        }, 500);
    }
}

window.startGame = function() {
    if (database && code) {
        database.ref(code + "/status").set(1);
    }
    triggerGameStartUI();
}

function triggerGameStartUI() {
    gameStarted = true;
    gameSortaStarted = true;

    if (document.getElementsByClassName("info")[0]) document.getElementsByClassName("info")[0].outerHTML = "";
    if (document.getElementById("startgame")) document.getElementById("startgame").outerHTML = "";

    var countDown = document.createElement("DIV");
    countDown.innerHTML = "3";
    countDown.className = "title";
    countDown.id = "countdown";
    if (f) f.appendChild(countDown);

    lap = document.createElement("DIV");
    lap.innerHTML = "1/" + LAPS;
    lap.className = "title";
    lap.id = "lap";
    if (f) f.appendChild(lap);

    setTimeout(function() { if (countDown) countDown.innerHTML = "2"; }, 1000);
    setTimeout(function() { if (countDown) countDown.innerHTML = "1"; }, 2000);
    setTimeout(function() { if (countDown) countDown.innerHTML = "GO!"; gameSortaStarted = false; }, 3000);
    setTimeout(function() { if (countDown) countDown.innerHTML = ""; }, 4000);
}

var host = function() {
    if (f) {
        f.style.transform = "translate3d(0, -100vh, 0)";
        setTimeout(function() {
            f.innerHTML = "<div class='info title'>Use this code to join!<div id='code'>Loading...</div></div><div id='startgame' class='title' onclick='startGame()'>Start!</div>";
            f.appendChild(element);
            f.style.transform = "none";
            getCode();
        }, 1000);
    }

    function getCode() {
        code = "";
        var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        for (var i = 0; i < 4; i++) code += letters[Math.floor(Math.random() * letters.length)];
        var codeDisplay = document.getElementById("code");
        if (codeDisplay) codeDisplay.innerHTML = code;

        if (database) {
            database.ref(code).set({ status: 0, players: {}, timestamp: Date.now() });
            setupPlayerListeners();
        } else {
            createLocalPlayer();
        }
    }
    join();
}

window.codeCheck = function(e) {
    if (e.keyCode === 13) {
        code = document.getElementById("incode").value.toUpperCase();
        setupPlayerListeners();
    }
}

var joinGame = function() {
    if (f) {
        f.style.transform = "translate3d(0, -100vh, 0)";
        setTimeout(function() {
            f.innerHTML = "<div class='info title'>Enter Code:<input id='incode' class='title' onkeyup='codeCheck(event)'></input></div>";
            f.appendChild(element);
            f.style.transform = "none";
        }, 1000);
    }
    join();
}

function createLocalPlayer() {
    me.data = { x: 0, y: 0, xv: 0, yv: 0, dir: 0, steer: 0, color: color, name: name };
    me.model = new THREE.Mesh(
        new THREE.BoxBufferGeometry(1, 1, 2),
        new THREE.MeshLambertMaterial({color: new THREE.Color("hsl(" + color + ", 100%, 50%)")})
    );
    me.model.position.set(0, 0.6, 0);
    scene.add(me.model);
    players["local"] = me;
}

function setupPlayerListeners() {
    createLocalPlayer();
    if (!database || !code) return;

    database.ref(code + "/players").on("child_added", function(p) {
        var key = p.key;
        if (players[key]) return;
        var playData = p.val();
        var model = new THREE.Mesh(
            new THREE.BoxBufferGeometry(1, 1, 2),
            new THREE.MeshLambertMaterial({color: new THREE.Color("hsl(" + (playData.color || 0) + ", 100%, 50%)")})
        );
        model.position.set(playData.x || 0, 0.6, playData.y || 0);
        scene.add(model);
        players[key] = { data: playData, model: model };
    });

    database.ref(code + "/status").on("value", function(v) {
        if (v.val() == 1) triggerGameStartUI();
    });
}

// Complete OG Track Parser with Wall Data for Collisions
function loadMap() {
    scene.background = new THREE.Color(0x7fb0ff);
    wallSegments = [];

    var trackRaw = document.getElementById("trackcode") ? document.getElementById("trackcode").innerHTML.trim() : "";
    if (!trackRaw) trackRaw = OG_TRACK_CODE.trim();

    var parts = trackRaw.split("|");
    var racedata = parts[0].trim().split(" ");
    var material = new THREE.MeshLambertMaterial({ color: new THREE.Color(0xf48342) });

    var mapObj = new THREE.Object3D();

    for (var i = 0; i < racedata.length; i++) {
        if (racedata[i] == "" || !racedata[i].includes("/")) continue;
        var p1 = racedata[i].split("/")[0].split(",");
        var p2 = racedata[i].split("/")[1].split(",");
        
        var x1 = -parseFloat(p1[0]) * mapscale;
        var z1 = parseFloat(p1[1]) * mapscale;
        var x2 = -parseFloat(p2[0]) * mapscale;
        var z2 = parseFloat(p2[1]) * mapscale;

        var dx = x2 - x1;
        var dz = z2 - z1;
        var dist = Math.sqrt(dx * dx + dz * dz);
        var angle = Math.atan2(dx, dz);

        var wall = new THREE.Mesh(
            new THREE.BoxBufferGeometry(0.3, 1.5, dist + 0.3),
            material
        );
        wall.position.set((x1 + x2) / 2, 0.75, (z1 + z2) / 2);
        wall.rotation.y = angle;
        mapObj.add(wall);

        // Save wall segment positions for collision calculations
        wallSegments.push({ x1: x1, z1: z1, x2: x2, z2: z2, dist: dist });
    }
    scene.add(mapObj);

    // Ground Plane
    var ground = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(2000, 2000),
        new THREE.MeshLambertMaterial({ color: new THREE.Color(0x57c115) })
    );
    ground.rotation.set(-Math.PI / 2, 0, 0);
    scene.add(ground);
}

// Physics Collision Engine - Prevents Driving Through Walls
function checkWallCollisions(player) {
    var px = player.x;
    var pz = player.y;
    var carRadius = 0.8;

    for (var i = 0; i < wallSegments.length; i++) {
        var w = wallSegments[i];
        
        // Find nearest point on wall line segment to player
        var l2 = (w.x2 - w.x1) * (w.x2 - w.x1) + (w.z2 - w.z1) * (w.z2 - w.z1);
        if (l2 === 0) continue;
        var t = ((px - w.x1) * (w.x2 - w.x1) + (pz - w.z1) * (w.z2 - w.z1)) / l2;
        t = Math.max(0, Math.min(1, t));

        var nearestX = w.x1 + t * (w.x2 - w.x1);
        var nearestZ = w.z1 + t * (w.z2 - w.z1);

        var distX = px - nearestX;
        var distZ = pz - nearestZ;
        var distance = Math.sqrt(distX * distX + distZ * distZ);

        if (distance < carRadius) {
            // Push player outside wall boundary
            var overlap = carRadius - distance;
            var nx = distX / (distance || 1);
            var nz = distZ / (distance || 1);

            player.x += nx * overlap;
            player.y += nz * overlap;

            // Bounce & reduce momentum
            player.xv *= -BOUNCE;
            player.yv *= -BOUNCE;
        }
    }
}

function join() {
    loadMap();

    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 3, 10);
    scene.add(camera);

    var light = new THREE.DirectionalLight(0xffffff, 0.7);
    light.position.set(3000, 2000, -2000);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    window.addEventListener('keydown', function(e) {
        if (e.key === "ArrowLeft" || e.key === "a") left = true;
        if (e.key === "ArrowRight" || e.key === "d") right = true;
    });
    window.addEventListener('keyup', function(e) {
        if (e.key === "ArrowLeft" || e.key === "a") left = false;
        if (e.key === "ArrowRight" || e.key === "d") right = false;
    });

    var lastTime = performance.now();
    function render(timestamp) {
        requestAnimationFrame(render);
        var timepassed = timestamp - lastTime;
        lastTime = timestamp;
        var warp = Math.min(timepassed / 16, 2);

        if (me.data && me.model) {
            if (left) me.data.steer = Math.PI / 6;
            if (right) me.data.steer = -Math.PI / 6;
            if (!(left ^ right)) me.data.steer = 0;

            if (!gameSortaStarted && gameStarted) {
                me.data.dir += me.data.steer / 10 * warp;
                me.data.xv += Math.sin(me.data.dir) * SPEED * warp;
                me.data.yv += Math.cos(me.data.dir) * SPEED * warp;

                me.data.xv *= Math.pow(0.99, warp);
                me.data.yv *= Math.pow(0.99, warp);

                me.data.x += me.data.xv * warp;
                me.data.y += me.data.yv * warp;

                // Run wall pushing physics
                checkWallCollisions(me.data);

                me.model.position.x = me.data.x;
                me.model.position.z = me.data.y;
                me.model.rotation.y = me.data.dir;
            }

            camera.position.x = me.model.position.x - Math.sin(me.data.dir) * 6;
            camera.position.z = me.model.position.z - Math.cos(me.data.dir) * 6;
            camera.position.y = me.model.position.y + 3;
            camera.lookAt(me.model.position);
        }

        renderer.render(scene, camera);
    }
    requestAnimationFrame(render);
}
