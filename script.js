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
        console.error("Firebase init fallback:", e);
    }
}
initFirebase();

// Setup UI animations on load
window.addEventListener("DOMContentLoaded", function() {
    setTimeout(function() { if (document.getElementById("title")) document.getElementById("title").style.transform = "none"; }, 500);
    setTimeout(function() { if (document.getElementsByClassName("menuitem")[0]) document.getElementsByClassName("menuitem")[0].style.transform = "none"; }, 1000);
    setTimeout(function() { if (document.getElementsByClassName("menuitem")[1]) document.getElementsByClassName("menuitem")[1].style.transform = "none"; }, 1200);
    setTimeout(function() { if (document.getElementById("settings")) document.getElementById("settings").style.transform = "none"; }, 1400);
});

var camera, renderer, scene, labels = [];
scene = new THREE.Scene();
renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

var mobile = navigator.userAgent.match("Mobile") != null || navigator.userAgent.match("Linux;") != null;
var element = renderer.domElement;

var name = "Player", code = "", players = {}, me = {}, gameStarted = false, gameSortaStarted = false, left = false, right = false;
var color = Math.floor(Math.random() * 360);
var f = document.getElementById("fore");
var s = document.getElementById("slider");

// Color Picker Update
function updateColorFromEvent(e) {
    var picker = document.getElementById("colorpicker");
    if (!picker) return;
    var rect = picker.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var pct = Math.max(0, Math.min(1, x / rect.width));
    color = Math.floor(pct * 360);
    
    if (s) {
        s.style.left = (pct * 100) + "%";
        s.style.backgroundColor = "hsl(" + color + ", 100%, 50%)";
    }
}

// Menu Transition -> Next Screen with Settings option backplate
var menu2 = function() {
    var nameInput = document.getElementById("name");
    if (nameInput && nameInput.value.trim() !== "") {
        name = nameInput.value.trim();
    }

    if (f) {
        f.style.transform = "translate3d(0, -100vh, 0)";
        setTimeout(function() {
            f.innerHTML = `
                <div class='menuitem title button' id='host' onclick='host()'>Host Game</div>
                <div class='menuitem title button' id='join' style='margin-top:15px;' onclick='joinGame()'>Join Game</div>
                <div id='settings' class='menuitem title button' style='margin-top:15px;' onclick='toggleSettings()'>Settings</div>
                <div id='settings-panel' style='display:none; margin-top:10px; font-size:12px; background:rgba(0,0,0,0.4); padding:10px; border-radius:8px;'>
                    Laps: <input id='lapcount' type='number' value='5' style='width:40px;'>
                </div>
            `;
            f.style.transform = "none";
        }, 500);
    }
}

function toggleSettings() {
    var panel = document.getElementById("settings-panel");
    if (panel) {
        panel.style.display = panel.style.display === "none" ? "block" : "none";
    }
}

// Click Host Game
var host = function() {
    if (f) {
        f.style.transform = "translate3d(0, -100vh, 0)";
        setTimeout(function() {
            f.innerHTML = `
                <div class='info title'>Room Code:<br/><div id='code' style='font-size:32px; color:#00ff00; margin:10px 0;'>Generating...</div></div>
                <div id='startgame' class='menuitem title button' onclick='startGame()'>Start!</div>
            `;
            f.style.transform = "none";
            getCode();
        }, 500);
    }

    function getCode() {
        code = Math.random().toString(36).substring(2, 6).toUpperCase();
        var codeElem = document.getElementById("code");
        if (codeElem) codeElem.innerHTML = code;

        if (database) {
            database.ref(code).set({
                status: 0,
                players: {},
                timestamp: Date.now()
            });
            setupPlayerListeners();
        } else {
            // Local fallback player setup
            createLocalPlayer();
        }
    }
    init3DScene();
}

// Click Join Game
var joinGame = function() {
    if (f) {
        f.style.transform = "translate3d(0, -100vh, 0)";
        setTimeout(function() {
            f.innerHTML = `
                <div class='info title'>Enter Code:<br/>
                    <input id='incode' class='title' style='text-transform:uppercase; margin-top:10px;' onkeyup='codeCheck(event)' maxlength='4'></input>
                    <div class='menuitem title button' style='margin-top:10px;' onclick='submitJoinCode()'>Join</div>
                </div>
            `;
            f.style.transform = "none";
        }, 500);
    }
    init3DScene();
}

function submitJoinCode() {
    var inputVal = document.getElementById("incode").value.toUpperCase();
    if (inputVal) {
        code = inputVal;
        setupPlayerListeners();
        if (f) f.innerHTML = "<div class='info title'>Joined Room: " + code + "<br/><span style='font-size:12px;'>Waiting for Host to start...</span></div>";
    }
}

window.codeCheck = function(e) {
    if (e.keyCode === 13) submitJoinCode();
}

// Start Game Trigger
window.startGame = function() {
    if (database && code) {
        database.ref(code + "/status").set(1);
    }
    triggerGameStartUI();
}

function triggerGameStartUI() {
    gameStarted = true;
    gameSortaStarted = true;

    if (f) f.style.display = "none"; // Hide menu UI overlay completely when race starts

    var countDown = document.createElement("DIV");
    countDown.innerHTML = "3";
    countDown.style.cssText = "position:fixed; top:40%; left:50%; transform:translate(-50%,-50%); font-size:80px; color:#fff; font-family:sans-serif; font-weight:bold; z-index:999;";
    document.body.appendChild(countDown);

    setTimeout(function() { if(countDown) countDown.innerHTML = "2"; }, 1000);
    setTimeout(function() { if(countDown) countDown.innerHTML = "1"; }, 2000);
    setTimeout(function() { if(countDown) countDown.innerHTML = "GO!"; gameSortaStarted = false; }, 3000);
    setTimeout(function() { if(countDown) countDown.remove(); }, 4000);
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
        if (p.key === me.refKey) return;
        var plData = p.val();
        var newModel = new THREE.Mesh(
            new THREE.BoxBufferGeometry(1, 1, 2),
            new THREE.MeshLambertMaterial({color: new THREE.Color("hsl(" + (plData.color || 0) + ", 100%, 50%)")})
        );
        newModel.position.set(plData.x || 0, 0.6, plData.y || 0);
        scene.add(newModel);

        players[p.key] = { data: plData, model: newModel };
    });

    database.ref(code + "/status").on("value", function(v) {
        if (v.val() == 1) {
            triggerGameStartUI();
        }
    });
}

// 3D Engine Initialization
function loadMap() {
    scene.background = new THREE.Color(0x7fb0ff);

    // Track Ground Plane
    var ground = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(1000, 1000),
        new THREE.MeshLambertMaterial({color: new THREE.Color(0x57c115)})
    );
    ground.rotation.set(-Math.PI / 2, 0, 0);
    scene.add(ground);

    // Default Boundary Walls
    var wallMat = new THREE.MeshLambertMaterial({color: 0xf48342});
    var wall1 = new THREE.Mesh(new THREE.BoxBufferGeometry(100, 2, 1), wallMat);
    wall1.position.set(0, 1, -50);
    scene.add(wall1);

    var wall2 = new THREE.Mesh(new THREE.BoxBufferGeometry(100, 2, 1), wallMat);
    wall2.position.set(0, 1, 50);
    scene.add(wall2);
}

function init3DScene() {
    loadMap();

    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 4, 8);
    scene.add(camera);

    var light = new THREE.DirectionalLight(0xffffff, 0.8);
    light.position.set(100, 200, 100);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));

    document.body.appendChild(renderer.domElement);

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

        if (gameStarted && me.data && me.model) {
            if (left) me.data.steer = Math.PI / 6;
            if (right) me.data.steer = -Math.PI / 6;
            if (!(left ^ right)) me.data.steer = 0;

            if (!gameSortaStarted) {
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

                if (database && code && me.refKey) {
                    database.ref(code + "/players/" + me.refKey).update(me.data);
                }
            }

            // Lock camera directly behind player car
            camera.position.x = me.model.position.x - Math.sin(me.data.dir) * 6;
            camera.position.z = me.model.position.z - Math.cos(me.data.dir) * 6;
            camera.position.y = me.model.position.y + 3;
            camera.lookAt(me.model.position);
        }

        renderer.render(scene, camera);
    }
    requestAnimationFrame(render);
}
