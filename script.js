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

var database, connectedN = -1, connectedS = undefined;

// Safe Firebase Initialization
function initFirebase() {
    if (database) return;
    try {
        var app;
        var existingApp = firebase.apps && firebase.apps.find(function(a) { return a.name === 'server0'; });
        if (existingApp) {
            app = existingApp;
        } else {
            app = firebase.initializeApp(serverList[0], "server0");
        }
        database = app.database();
        app.auth().signInAnonymously().catch(function(e){ console.warn(e); });
    } catch(e) {
        console.error("Firebase load error:", e);
    }
}
initFirebase();

// Menu UI Animations
setTimeout(function() { if (document.getElementById("title")) document.getElementById("title").style.transform = "none"; }, 500);
setTimeout(function() { if (document.getElementsByClassName("menuitem")[0]) document.getElementsByClassName("menuitem")[0].style.transform = "none"; }, 1000);
setTimeout(function() { if (document.getElementsByClassName("menuitem")[1]) document.getElementsByClassName("menuitem")[1].style.transform = "none"; }, 1200);
setTimeout(function() { if (document.getElementsByClassName("menuitem")[2]) document.getElementsByClassName("menuitem")[2].style.transform = "none"; }, 1400);

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

var mobile = navigator.userAgent.match("Mobile") != null || navigator.userAgent.match("Linux;") != null;
var element = renderer.domElement;

var name, code, players = {}, me = {}, gameStarted = false, gameSortaStarted = false, left = false, right = false, lap;
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
    if (document.getElementById("name") && document.getElementById("name").value != "")
        name = document.getElementById("name").value;
    else
        name = "Player " + Math.floor(Math.random() * 100);

    if (f) {
        f.style.transform = "translate3d(0, -100vh, 0)";
        setTimeout(function() {
            f.innerHTML = "<div class='menuitem title button' id='host' onclick='host()'>Host a game</div><div class='menuitem title button' id='join' onclick='joinGame()'>Join a game</div>";
            f.style.transform = "none";
        }, 500);
    }
}

window.startGame = function() {
    if (!database || !code) {
        // Fallback for offline start
        triggerGameStartUI();
        return;
    }
    database.ref(code + "/status").set(1);
}

var host = function() {
    if (f) {
        f.style.transform = "translate3d(0, -100vh, 0)";
        setTimeout(function() {
            f.innerHTML = "<div class='info title'>Use this code to join!<div id='code'>Loading...</div></div><div id='startgame' class='title' onclick='startGame()'>Start!</div>";
            f.style.transform = "none";
            getCode();
        }, 500);
    }

    function getCode() {
        code = Math.random().toString(36).substring(2, 6).toUpperCase();
        var codeElem = document.getElementById("code");
        if (codeElem) codeElem.innerHTML = code;

        if (database) {
            var trackCode = document.getElementById("trackcode") ? document.getElementById("trackcode").innerHTML : "";
            database.ref(code).set({
                status: 0,
                players: {},
                map: trackCode,
                timestamp: Date.now()
            });
            setupPlayerListeners();
        }
    }
    join();
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

    setTimeout(function() { if(countDown) countDown.innerHTML = "2"; }, 1000);
    setTimeout(function() { if(countDown) countDown.innerHTML = "1"; }, 2000);
    setTimeout(function() { if(countDown) countDown.innerHTML = "GO!"; gameSortaStarted = false; }, 3000);
    setTimeout(function() { if(countDown) countDown.innerHTML = ""; }, 4000);
}

function setupPlayerListeners() {
    if (!database) return;

    database.ref(code + "/players").on("child_added", function(p) {
        var key = p.key;
        players[key] = {
            data: p.val(),
            model: new THREE.Mesh(
                new THREE.BoxBufferGeometry(1, 1, 2),
                new THREE.MeshLambertMaterial({color: new THREE.Color("hsl(" + (p.val().color || 0) + ", 100%, 50%)")})
            )
        };
        var pl = players[key];
        pl.model.position.set(pl.data.x || 0, 0.6, pl.data.y || 0);
        scene.add(pl.model);

        if (me.ref && key == me.ref.key) {
            me.model = pl.model;
        }
    });

    database.ref(code + "/players").on("child_changed", function(p) {
        if (players[p.key]) {
            players[p.key].data = p.val();
        }
    });

    me.ref = database.ref(code + "/players").push();
    me.data = {
        x: 0, y: 0, xv: 0, yv: 0, dir: 0, steer: 0, color: color, name: name
    };
    me.ref.set(me.data);

    database.ref(code + "/status").on("value", function(v) {
        if (v.val() == 1) {
            triggerGameStartUI();
        }
    });
}

window.codeCheck = function(e) {
    if (e.keyCode === 13) {
        var inputVal = document.getElementById("incode").value.toUpperCase();
        code = inputVal;
        setupPlayerListeners();
        showLobbyUI();
    }
}

function showLobbyUI() {
    if (f) {
        f.innerHTML = "<div class='info title'>Joined Room: " + code + "<br/><span style='font-size:12px;'>Waiting for host...</span></div>";
    }
}

var joinGame = function() {
    if (f) {
        f.style.transform = "translate3d(0, -100vh, 0)";
        setTimeout(function() {
            f.innerHTML = "<div class='info title'>Enter Code:<br/><input id='incode' class='title' onkeyup='codeCheck(event)'></input></div>";
            f.style.transform = "none";
        }, 500);
    }
    join();
}

var map, trees, signs, startc, main;

function loadMap() {
    var trackElem = document.getElementById("trackcode");
    if (!trackElem || !trackElem.innerHTML.includes("|")) return;

    var parts = trackElem.innerHTML.trim().split("|");
    var racedata = parts[0].trim().split(" ");
    var material = new THREE.MeshLambertMaterial({color: new THREE.Color(0xf48342)});
    
    map = new THREE.Object3D();
    for (var i = 0; i < racedata.length; i++) {
        if (racedata[i] == "" || !racedata[i].includes("/")) continue;
        var p1 = racedata[i].split("/")[0].split(",");
        var p2 = racedata[i].split("/")[1].split(",");
        var point1 = new THREE.Vector2(parseFloat(p1[0]), parseFloat(p1[1]));
        var point2 = new THREE.Vector2(parseFloat(p2[0]), parseFloat(p2[1]));
        
        var wall = new THREE.Mesh(
            new THREE.BoxBufferGeometry(point1.distanceTo(point2) * mapscale + 0.3, 1.5, 0.3),
            material
        );
        var angle = Math.atan2((point1.y - point2.y), (point1.x - point2.x));
        wall.position.set(-(point1.x + point2.x) / 2 * mapscale, 0.75, (point1.y + point2.y) / 2 * mapscale);
        wall.rotation.set(0, angle, 0, "YXZ");
        wall.plane = new THREE.Plane(new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle));
        wall.width = point1.distanceTo(point2) * mapscale;
        wall.p1 = point1.clone().multiply(new THREE.Vector2(-mapscale, mapscale));
        wall.p2 = point2.clone().multiply(new THREE.Vector2(-mapscale, mapscale));
        map.add(wall);
    }
    scene.add(map);

    main = new THREE.Object3D();
    var ground = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(1000, 1000),
        new THREE.MeshLambertMaterial({color: new THREE.Color(0x57c115)})
    );
    ground.rotation.set(-Math.PI / 2, 0, 0);
    main.add(ground);
    scene.add(main);
}

function join() {
    loadMap();

    scene.background = new THREE.Color(0x7fb0ff);

    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 3, 10);
    scene.add(camera);

    var light = new THREE.DirectionalLight(0xffffff, 0.8);
    light.position.set(100, 200, 100);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));

    if (f) f.appendChild(element);

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

        if (gameStarted && me.data) {
            if (left) me.data.steer = Math.PI / 6;
            if (right) me.data.steer = -Math.PI / 6;
            if (!(left ^ right)) me.data.steer = 0;

            if (me.ref) {
                me.ref.update({
                    x: me.data.x,
                    y: me.data.y,
                    xv: me.data.xv,
                    yv: me.data.yv,
                    dir: me.data.dir,
                    steer: me.data.steer
                });
            }

            if (!gameSortaStarted) {
                for (var p in players) {
                    var play = players[p];
                    if (!play || !play.data) continue;

                    play.data.dir += (play.data.steer || 0) / 10 * warp;
                    play.data.xv += Math.sin(play.data.dir) * SPEED * warp;
                    play.data.yv += Math.cos(play.data.dir) * SPEED * warp;

                    play.data.xv *= Math.pow(0.99, warp);
                    play.data.yv *= Math.pow(0.99, warp);

                    play.data.x += play.data.xv * warp;
                    play.data.y += play.data.yv * warp;

                    if (play.model) {
                        play.model.position.x = play.data.x;
                        play.model.position.z = play.data.y;
                        play.model.rotation.y = play.data.dir;
                    }
                }
            }

            // Camera follow local player
            if (me.model) {
                camera.position.x = me.model.position.x - Math.sin(me.data.dir) * 6;
                camera.position.z = me.model.position.z - Math.cos(me.data.dir) * 6;
                camera.position.y = 3;
                camera.lookAt(me.model.position);
            }
        }

        renderer.render(scene, camera);
    }
    requestAnimationFrame(render);
}
