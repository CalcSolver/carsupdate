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

function MODS() {}

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
        console.error("Firebase connection fallback:", e);
    }
}
initFirebase();

// Restore original title and menu animations
setTimeout(function() {
    if (document.getElementById("title")) document.getElementById("title").style.transform = "none";
}, 500);
setTimeout(function() {
    if (document.getElementsByClassName("menuitem")[0]) document.getElementsByClassName("menuitem")[0].style.transform = "none";
}, 1000);
setTimeout(function() {
    if (document.getElementsByClassName("menuitem")[1]) document.getElementsByClassName("menuitem")[1].style.transform = "none";
}, 1200);
setTimeout(function() {
    if (document.getElementsByClassName("menuitem")[2]) document.getElementsByClassName("menuitem")[2].style.transform = "none";
}, 1400);
setTimeout(function() {
    if (document.getElementById("mywebsitelink")) document.getElementById("mywebsitelink").style.transform = "none";
}, 1600);
setTimeout(function() {
    if (document.getElementById("settings")) document.getElementById("settings").style.transform = "none";
}, 1800);

if (top != self) {
    if (document.getElementById("warning")) document.getElementById("warning").style.display = "block";
}

function forceScroll() {
    requestAnimationFrame(forceScroll);
    window.scrollTo(0, 0);
}
forceScroll();

var camera, renderer, scene, labels = [];
scene = new THREE.Scene();
renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// Append renderer element to screen body so canvas is always rendered behind UI
document.body.appendChild(renderer.domElement);
renderer.domElement.style.position = "fixed";
renderer.domElement.style.top = "0";
renderer.domElement.style.left = "0";
renderer.domElement.style.zIndex = "-1";

var mobile = navigator.userAgent.match("Mobile") != null || navigator.userAgent.match("Linux;") != null;
var element = renderer.domElement;

var name = "Nerd with No Name", code = "", players = {}, me = {}, gameStarted = false, gameSortaStarted = false, left = false, right = false, lap;
var color = Math.floor(Math.random() * 360);
var f = document.getElementById("fore");
var s = document.getElementById("slider");

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
    
    VR = document.getElementById("cardboard") ? document.getElementById("cardboard").className == "tools sel" : false;
    
    if (f) {
        f.style.transform = "translate3d(0, -100vh, 0)";
        setTimeout(function() {
            f.innerHTML = "<div class='menuitem title button' id='host' ontouchstart='this.click()' onclick='host()'>Host a game</div><div class='menuitem title button' ontouchstart='this.click()' id='join' onclick='joinGame()'>Join a game</div>";
            f.style.transform = "none";
            
            setTimeout(function() {
                if (document.getElementById("host")) {
                    document.getElementById("host").style.transform = "none";
                    setTimeout(function() { document.getElementById("host").style.transition = "transform .2s, box-shadow .2s"; }, 500);
                }
            }, 500);
            
            setTimeout(function() {
                if (document.getElementById("join")) {
                    document.getElementById("join").style.transform = "none";
                    setTimeout(function() { document.getElementById("join").style.transition = "transform .2s, box-shadow .2s"; }, 500);
                }
            }, 1000);
        }, 500);
    }
}

// Start Game Execution
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
    if (document.getElementById("host")) document.getElementById("host").onclick = null;
    if (f) {
        f.style.transform = "translate3d(0, -100vh, 0)";
        setTimeout(function() {
            f.innerHTML = "<div class='info title'>Use this code to join the game!<div id='code'>Loading...</div></div><div id='startgame' class='title' onclick='startGame()' ontouchstart='this.click()'>Start!</div>";
            if (VR) f.innerHTML += "<div id='divider'></div>";
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
            var trackData = document.getElementById("trackcode") ? document.getElementById("trackcode").innerHTML : "";
            database.ref(code).set({
                status: 0,
                players: {},
                map: trackData,
                timestamp: Date.now()
            });
            setupPlayerListeners();
        } else {
            createLocalPlayer();
        }
    }
    join();
}

window.codeCheck = function(e) {
    if (e.keyCode === 13) {
        var inputVal = document.getElementById("incode").value.toUpperCase();
        code = inputVal;
        setupPlayerListeners();
    }
}

var joinGame = function() {
    if (document.getElementById("join")) document.getElementById("join").onclick = null;
    if (f) {
        f.style.transform = "translate3d(0, -100vh, 0)";
        setTimeout(function() {
            f.innerHTML = "<div class='info title'>Enter a code to join a game!<input id='incode' class='title' onkeyup='codeCheck(event)' ontouchstart='this.focus()'></input></div>";
            if (VR) f.innerHTML += "<div id='divider'></div>";
            f.style.transform = "none";
        }, 1000);
    }
    join();
}

function createLocalPlayer() {
    me.data = { x: 0, y: 0, xv: 0, yv: 0, dir: 0, steer: 0, color: color, name: name };
    me.model = new THREE.Mesh(
        new THREE.BoxBufferGeometry(1.2, 0.8, 2.2),
        new THREE.MeshLambertMaterial({color: new THREE.Color("hsl(" + color + ", 100%, 50%)")})
    );
    me.model.position.set(0, 0.4, 0);
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
            new THREE.BoxBufferGeometry(1.2, 0.8, 2.2),
            new THREE.MeshLambertMaterial({color: new THREE.Color("hsl(" + (playData.color || 0) + ", 100%, 50%)")})
        );
        model.position.set(playData.x || 0, 0.4, playData.y || 0);
        scene.add(model);

        players[key] = { data: playData, model: model };
    });

    database.ref(code + "/status").on("value", function(v) {
        if (v.val() == 1) triggerGameStartUI();
    });
}

function loadMap() {
    // Clear old elements if reloading
    scene.background = new THREE.Color(0x7fb0ff);

    // Main Grass Field
    var groundGeo = new THREE.PlaneBufferGeometry(2000, 2000);
    var groundMat = new THREE.MeshLambertMaterial({ color: 0x57c115 });
    var ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    scene.add(ground);

    // Track Asphalt Road Loops & Outer Barriers
    var roadMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    var wallMat = new THREE.MeshLambertMaterial({ color: 0xdd4433 });

    // Inner Track Oval
    var roadTrack = new THREE.Mesh(new THREE.RingBufferGeometry(30, 60, 32), roadMat);
    roadTrack.rotation.x = -Math.PI / 2;
    roadTrack.position.y = 0.01;
    scene.add(roadTrack);

    // Track Guard Rails / Boundary Walls
    var outerWall = new THREE.Mesh(new THREE.CylinderBufferGeometry(61, 61, 2, 32, 1, true), wallMat);
    outerWall.position.y = 1;
    scene.add(outerWall);

    var innerWall = new THREE.Mesh(new THREE.CylinderBufferGeometry(29, 29, 2, 32, 1, true), wallMat);
    innerWall.position.y = 1;
    scene.add(innerWall);
}

function join() {
    loadMap();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    scene.add(camera);

    var light = new THREE.DirectionalLight(0xffffff, 0.8);
    light.position.set(100, 200, 100);
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

                me.model.position.x = me.data.x;
                me.model.position.z = me.data.y;
                me.model.rotation.y = me.data.dir;
            }

            camera.position.x = me.model.position.x - Math.sin(me.data.dir) * 8;
            camera.position.z = me.model.position.z - Math.cos(me.data.dir) * 8;
            camera.position.y = me.model.position.y + 4;
            camera.lookAt(me.model.position);
        }

        renderer.render(scene, camera);
    }
    requestAnimationFrame(render);
}
