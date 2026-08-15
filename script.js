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
var LAPS = 3; // Set to 3 Laps

function MODS(){

}

// Firebase configuration
var serverList = [
    {
        apiKey: "AIzaSyDiJsMLlix5o9XqPW1EpeBvuA15XNjlR8M",
        authDomain: "car-game-a86b9.firebaseapp.com",
        databaseURL: "https://car-game-a86b9.firebaseio.com",
        projectId: "car-game-a86b9",
        storageBucket: "car-game-a86b9.appspot.com",
        messagingSenderId: "722396856191",
        appId: "1:722396856191:web:fb5f72917856108a50e44a"
    }
];

// Map Track Code String
var TRACK_DATA = "-3,0/-3,14 -3,14/-4,18 -4,18/-8,22 -8,22/-12,23 3,16/2,20 2,20/0,23 -10,29/-6,28 -6,28/-3,26 -3,26/0,23 -12,23/-18,23 -18,23/-22,22 -22,22/-26,18 -26,18/-27,14 -10,29/-20,29 -20,29/-24,28 -24,28/-27,26 -27,26/-30,23 -30,23/-32,20 -32,20/-33,16 -27,14/-27,-13 -27,-13/-26,-17 -26,-17/-22,-21 -22,-21/-18,-22 -33,16/-33,-15 -33,-15/-32,-19 -32,-19/-30,-22 -30,-22/-27,-25 -27,-25/-24,-27 -24,-27/-20,-28 -3,-13/-3,0 -3,-13/-4,-17 -4,-17/-8,-21 -8,-21/-12,-22 -18,-22/-12,-22 -20,-28/-10,-28 -10,-28/-6,-27 -6,-27/-3,-25 -3,-25/0,-22 0,-22/2,-19 2,-19/3,-15 3,-15/3,16 |-3,3/3,3 -27,-3/-33,-3 |-19,20 -20,19 -21,19 -22,18 -22,17 -22,16 -22,15 -21,15 -20,15 -20,14 -21,13 -21,12 -22,11 -23,10 -23,7 -22,6 -21,5 -21,4 -21,3 -20,2 -21,1 -22,0 -23,0 -23,-1 -24,-1 -24,-2 -24,-3 -24,-4 -24,-6 -24,-7 -23,-7 -23,-8 -23,-9 -22,-9 -22,-10 -21,-11 -21,-12 -21,-13 -21,-14 -21,-15 -21,-16 -20,-16 -19,-16 -18,-16 -17,-16 -16,-16 -15,-16 -15,-15 -14,-14 -14,-12 -14,-11 -14,-10 -13,-10 -11,-10 -10,-10 -9,-10 -8,-9 -8,-8 -7,-8 -7,-7 -8,-6 -8,-5 -7,-4 -7,-3 -6,-2 -5,-1 -4,0 -4,1 -5,2 -5,4 -6,6 -7,9 -7,10 -7,11 -7,12 -8,13 -8,14 -8,15 -9,15 -10,16 -11,16 -11,17 -12,17 -13,16 -13,14 -13,13 -11,-16 -10,-16 -9,-16 -8,-15 -8,-14 -8,-13 -8,-12 -8,-10 -9,-9 -9,-7 -11,-6 -12,-5 -14,-5 -16,-5 -16,-4 -15,-2 -15,0 -14,1 -14,2 -13,2 -12,2 -10,2 -9,2 -8,2 -8,3 -9,3 -10,4 -12,5 -14,5 -16,5 -17,4 -18,3 -18,2 -18,1 -19,1 -19,2 -18,4 -17,6 -16,7 -15,9 -13,9 -12,10 -11,11 -10,11 -10,12 -10,13 -11,14 -12,16 -13,17 -14,17 -16,18 -17,17 -17,16 -18,15 -18,14 -17,14 -17,13 -16,13 -16,12 -14,13 -12,14 -11,15 -10,17 -10,18 -10,19 -10,20 -11,20 -41,-9 -41,-8 -40,-8 -39,-8 -38,-7 -37,-6 -37,-5 -37,-3 -37,-2 -38,-1 -40,0 -41,0 -42,0 -43,0 -43,-1 -42,-2 -41,-2 -39,-1 -38,1 -37,2 -38,3 -39,4 -41,6 -43,7 -42,7 -40,7 -39,8 -39,10 -39,11 -40,12 -41,13 -42,14 -42,15 -42,16 -41,17 -41,18 -42,20 -42,21 -41,21 -40,22 -40,24 -40,25 -40,26 -39,27 -38,28 -37,28 -36,28 -36,27 -35,27 -36,26 -36,24 -36,23 -36,22 -35,22 -35,23 -34,23 -33,25 -32,27 -32,28 -31,30 -30,31 -29,32 -28,32 -27,32 -25,33 -23,33 -20,33 -19,33 -19,34 -19,35 -19,36 -19,37 -18,37 -17,37 -16,38 -14,38 -13,38 -12,38 -12,37 -11,36 -10,36 -8,37 -6,37 -4,37 -2,36 1,35 2,35 3,34 3,33 4,32 4,31 4,30 5,30 5,29 6,27 7,26 8,25 9,25 9,24 10,24 -38,-10 -39,-10 -40,-11 -41,-12 -45,-14 -47,-16 -47,-18 -47,-19 -45,-21 -43,-21 -41,-21 -39,-21 -40,-21 -42,-21 -43,-23 -42,-25 -40,-26 -38,-27 -37,-27 -36,-27 -37,-26 -37,-28 -35,-31 -33,-32 -29,-33 -25,-33 -20,-32 -18,-31 -19,-31 -20,-30 -21,-30 -21,-31 -21,-32 -22,-33 -22,-35 -22,-36 -22,-37 -21,-38 -20,-39 -20,-40 -19,-41 -18,-41 -17,-42 -15,-43 -12,-43 -10,-44 -9,-44 -9,-43 -8,-42 -8,-40 -8,-39 -8,-37 -8,-36 -7,-36 -5,-37 -4,-37 -3,-37 -6,-36 -9,-36 -14,-36 -17,-37 -19,-38 -20,-38 -24,-38 -25,-38 -26,-38 -27,-38 -27,-37 -27,-36 -27,-34 -28,-32 -29,-31 -29,-30 -30,-28 -30,-27 -30,-26 -31,-29 -32,-31 -33,-33 -33,-35 -32,-37 -30,-38 -23,-38 -19,-39 -15,-39 -12,-39 -9,-39 -6,-39 -3,-38 -1,-38 1,-37 2,-35 3,-33 3,-31 3,-30 4,-30 4,-29 5,-30 5,-31 4,-32 2,-33 2,-34 1,-33 1,-31 2,-29 2,-27 3,-26 4,-24 5,-23 6,-22 7,-22 8,-23 9,-25 9,-26 9,-28 9,-29 9,-31 9,-32 8,-32 8,-30 8,-29 7,-27 7,-24 8,-22 9,-21 10,-20 10,-19 11,-19 12,-19 11,-18 10,-17 9,-16 8,-15 8,-14 8,-13 9,-11 10,-10 12,-9 14,-8 16,-8 16,-7 15,-6 14,-6 14,-5 13,-4 13,-3 13,-2 14,-1 15,-1 16,0 17,0 18,0 19,0 19,1 19,2 17,3 15,4 13,4 12,4 11,4 10,3 10,2 9,1 9,0 9,-1 10,-2 11,-3 15,-3 17,-3 19,-3 20,-2 21,-2 22,-1 22,0 21,2 19,5 16,7 9,9 6,10 5,10 7,10 9,10 10,10 11,11 11,12 10,13 10,14 9,15 9,16 11,17 12,18 14,19 14,20 14,21 12,21 10,22 8,23 7,23 6,23 7,22 7,21 8,19 10,18 11,18 12,17 13,17 18,14 17,14 16,15 15,15 14,15 14,14 13,12 12,9 11,5 11,2 10,1 11,0 12,1 14,2 14,3 3,28 2,29 1,30 0,31 -1,31 -2,32 -2,33 -2,35 -1,36 0,37 2,38 3,38 4,38 5,38 5,37 6,36 5,34 4,33 2,33 0,33 -3,34 -4,34 -5,35 -23,36 -23,37 -22,37 -22,38 -23,39 -24,38 -25,37 -26,36 -26,34 -26,33 -25,32 -24,31 -23,31 -22,31 -22,32 -22,33 -24,33 -33,35 -34,35 -36,35 -36,34 -37,33 -37,32 -37,30 -37,29 -39,30 -46,20 -46,19 -46,18 -46,17 -46,16 -47,15 -48,14 -48,13 -49,12 -48,10 -47,10 -46,9 -45,9 -44,9 -43,9 -46,1 -48,1 -48,0 -49,0 -49,-1 -49,-2 -48,-3 -53,-8 -52,-9 -51,-10 -50,-11 -49,-11 -42,-9 -43,-9 -44,-10 -44,-11 -45,-11 -45,-12 -45,-13 -45,-15 -49,-22 -49,-23 -50,-24 -50,-25 -49,-26 -48,-26 -47,-27 -46,-26 -46,-25 -44,-27 -44,-28 -43,-28 -43,-29 -43,-30 -42,-30 -41,-31 -40,-32 -39,-32 -38,-32 -37,-36 -37,-37 -36,-38 -36,-39 -34,-39 -33,-39 0,-41 1,-41 2,-41 3,-41 14,-31 15,-31 15,-30 16,-29 16,-28 16,-15 15,-14 15,-13 16,-12 17,-12 21,-12 21,-11 21,-9 21,-8 21,9 21,10 22,10 22,11 22,12 22,13 22,14 14,27 13,27 12,29 11,30 11,31 13,36 13,37 12,37 11,38 -3,41 -3,42 -4,43 -5,43 -6,44 -7,44 -7,43 -12,42 -13,42 -13,43 -14,43 -14,44 -22,-15 -22,-14 -19,-15 -20,-13 -20,-15 -18,-15 -19,-17 -18,-17 -16,-17 -17,-17 -20,3 -22,5 -21,14 -21,16 -21,17 -23,8 -23,9 -24,9 -37,23 3,27 2,25 -2,31 -3,30 -3,28 -3,29 -4,31 -4,32 -3,33 -5,30 -7,38 -6,36 11,-10 12,-17 13,-17 14,-17 15,-16 13,-16 15,-18 16,-19 16,-20 22,-10 22,-9 21,-7 20,-8 19,-7 18,-7 21,12 20,13 19,13 23,15 23,16 1,-40 2,-40 2,-39 2,-38 2,-42 1,-42 2,-43 2,-44 3,-40 3,-38 3,-36 -16,-44 -17,-43 -17,-45 -17,-46 -25,-39 -26,-39 -25,-41 -24,-42 -24,-40 -35,-40 -36,-40 -38,-38 -38,-39 -52,-11 -54,-12 -53,-12 -52,-14 -54,-13 -53,-17 -54,-15 -51,-16 -52,-18 -52,-16 -50,-18 -53,-19 -54,-17 -50,1 -50,2 -50,3 -51,4 -52,3 -52,4 -53,4 -53,3 -54,2 -55,0 -50,5 -49,11 -19,-2 -19,-3 -20,-4 -20,-5 -20,-6 -20,-7 -20,-8 -19,-8 -19,-9 -18,-9 -17,-9 -16,-9 -18,-8 -19,-6 -19,-7 -17,-10 -15,-11 -16,-10 -15,-10 -14,-9 -15,-6 -16,-6 ||SPEED*=3;BOUNCE=0.2;MOUNTAIN_DIST=325;OOB_DIST=300;LAPS=3;";

var database, connectedN = -1, connectedS = undefined;

for(var i = 0; i < serverList.length; i++){
    try {
        let appName = "server" + i;
        let la = firebase.initializeApp(serverList[i], appName);
        let li = i;
        la.auth().signInAnonymously().then(() => {
            database = la.database();
            database.ref(".info/connected").on("value", function(snap){
                if (snap.val() === true) {
                    connectedN = li;
                    connectedS = la;
                }
            });
        }).catch(err => console.error("Firebase auth error:", err));
    } catch(e) {
        console.error("Initialization error:", e);
    }
}

setTimeout(function(){
    var title = document.getElementById("title");
    if(title) title.style.transform = "none";
}, 500);

if(top != self) {
    var warn = document.getElementById("warning");
    if(warn) warn.style.display = "block";
}

function forceScroll(){
    requestAnimationFrame(forceScroll);
    window.scrollTo(0, 0);
}
forceScroll();

var camera, renderer, scene, labels = [];
scene = new THREE.Scene();
renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
var mobile = navigator.userAgent.match("Mobile")!=null||navigator.userAgent.match("Linux;")!=null;
var element = renderer.domElement;

var name, code, players = {}, me = {}, gameStarted = false, gameSortaStarted = false, left = false, right = false, lap;

color = Math.floor(Math.random() * 360);
var f = document.getElementById("fore");
var s = document.getElementById("slider");

updateColor = function(){
    if(s) {
        s.style.marginLeft = color / 360 * 80 + "vw";
        s.style.backgroundColor = "hsl(" + color + ", 100%, 50%)";
    }
    document.body.style.backgroundColor = "hsl(" + color + ", 50%, 50%)";
}
updateColor();

menu2 = function(){
    if(mobile){
        function reactOrientation(e){
            var angle = screen.orientation.type == "portrait-primary" ? e.gamma : screen.orientation.type == "portrait-secondary" ? -e.gamma : screen.orientation.type == "landscape-primary" ? e.beta : screen.orientation.type == "landscape-secondary" ? -e.beta : 0;
            me.data.steer = Math.max(Math.min((-angle) / 180 * Math.PI, Math.PI / 6), -Math.PI / 6);
        }

        if(typeof DeviceOrientationEvent !== 'undefined' && DeviceOrientationEvent.requestPermission){
            DeviceOrientationEvent.requestPermission().then(permissionState => {
                if (permissionState === 'granted')
                    window.addEventListener('deviceorientation', reactOrientation);
            }).catch(console.error);
        } else {
            window.addEventListener('deviceorientation', reactOrientation);
        }
    }
    var nameInput = document.getElementById("name");
    name = (nameInput && nameInput.value !== "") ? nameInput.value : "Racer";
    
    var cb = document.getElementById("cardboard");
    VR = cb ? cb.className == "tools sel" : false;
    
    f.style.transform = "translate3d(0, -100vh, 0)";
    setTimeout(function(){
        f.innerHTML = "<div class='menuitem title button' id='host' onclick='host()'>Host a game</div><div class='menuitem title button' id='join' onclick='joinGame()'>Join a game</div>";
        f.style.transform = "none";
    }, 500);
}

host = function(){
    document.getElementById("host").onclick = null;
    f.style.transform = "translate3d(0, -100vh, 0)";
    setTimeout(function(){
        f.innerHTML = "<div class='info title'>Use this code to join!<div id='code'>Loading...</div></div><div id='startgame' class='title' onclick='startGame()'>Start!</div>";
        f.appendChild(element);
        f.style.transform = "none";
        getCode();
    }, 1000);

    function getCode(){
        code = "";
        var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        for(var i = 0; i < 4; i++)
            code += letters[Math.floor(Math.random() * letters.length)];
            
        database.ref(code).once("value", function(codeCheck){
            if(codeCheck.val() == null || codeCheck.val().status == -1 || !codeCheck.val().timestamp || Date.now() - codeCheck.val().timestamp > 86400000){
                document.getElementById("code").innerHTML = code;

                database.ref(code).set({
                    status: 0,
                    players: {},
                    map: TRACK_DATA,
                    timestamp: Date.now()
                });

                setupPlayerListeners();
            } else {
                getCode();
            }
        });
    }
    join();
}

function setupPlayerListeners(){
    database.ref(code + "/players").on("child_added", function(p){
        players[p.key] = {
            data: p.val(),
            model: new THREE.Mesh(new THREE.BoxBufferGeometry(1, 1, 2))
        };
        var pl = players[p.key];
        pl.model.position.set(pl.data.x, 0.6, pl.data.y);
        pl.model.material = new THREE.MeshLambertMaterial({color: new THREE.Color("hsl(" + pl.data.color + ", 100%, 50%)")});
        scene.add(pl.model);

        if(me.ref && p.key == me.ref.key){
            me.model = pl.model;
        }
    });

    database.ref(code + "/players").on("child_changed", function(p){
        if(players[p.key]) players[p.key].data = p.val();
    });

    database.ref(code + "/status").on("value", function(v){
        if(v.val() == 1){
            gameStarted = true;
            gameSortaStarted = true;
            
            lap = document.createElement("DIV");
            lap.innerHTML = "Lap 1/" + LAPS;
            lap.className = "title";
            lap.id = "lap";
            f.appendChild(lap);

            setTimeout(function(){ gameSortaStarted = false; }, 3000);
        }
    });
}

function startGame(){
    if(database && code) {
        database.ref(code + "/status").set(1);
    }
}

joinGame = function(){
    f.style.transform = "translate3d(0, -100vh, 0)";
    setTimeout(function(){
        f.innerHTML = "<div class='info title'>Enter Code:<input id='incode' class='title' onkeyup='codeCheck(event)'></input></div>";
        f.appendChild(element);
        f.style.transform = "none";
    }, 1000);
}

function codeCheck(e){
    var inCode = document.getElementById("incode").value.toUpperCase();
    if(inCode.length == 4){
        code = inCode;
        database.ref(code).once("value", function(snap){
            if(snap.exists()){
                setupPlayerListeners();
                join();
            } else {
                alert("Game code not found!");
            }
        });
    }
}

function loadMap(){
    var sections = TRACK_DATA.trim().split("|");
    var racedata = sections[0].trim().split(" ");
    var material = new THREE.MeshLambertMaterial({color: new THREE.Color(0xf48342)});
    
    map = new THREE.Object3D();
    for(var i = 0; i < racedata.length; i++){
        if(!racedata[i]) continue;
        var p1Raw = racedata[i].split("/")[0].split(",");
        var p2Raw = racedata[i].split("/")[1].split(",");
        var point1 = new THREE.Vector2(parseInt(p1Raw[0]), parseInt(p1Raw[1]));
        var point2 = new THREE.Vector2(parseInt(p2Raw[0]), parseInt(p2Raw[1]));
        
        var wall = new THREE.Mesh(
            new THREE.BoxBufferGeometry(point1.distanceTo(point2) * mapscale + 0.3, 1.5, 0.3),
            material
        );
        var angle = Math.atan2((point1.y - point2.y), (point1.x - point2.x));
        wall.position.set(-(point1.x + point2.x) / 2 * mapscale, 0.75, (point1.y + point2.y) / 2 * mapscale);
        wall.rotation.set(0, angle, 0, "YXZ");
        wall.plane = new THREE.Plane(new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle));
        wall.width = point1.distanceTo(point2) * mapscale;
        map.add(wall);
    }
    scene.add(map);

    // Start/Finish & Checkpoint Line Initialization (-3,3/3,3)
    var startdata = sections[1].trim().split(" ");
    startc = new THREE.Object3D();
    for(var i = 0; i < startdata.length; i++){
        if(!startdata[i]) continue;
        var p1Raw = startdata[i].split("/")[0].split(",");
        var p2Raw = startdata[i].split("/")[1].split(",");
        var point1 = new THREE.Vector2(parseInt(p1Raw[0]), parseInt(p1Raw[1]));
        var point2 = new THREE.Vector2(parseInt(p2Raw[0]), parseInt(p2Raw[1]));
        
        var wall = new THREE.Mesh(
            new THREE.BoxBufferGeometry(point1.distanceTo(point2) * mapscale, 0.1, 1),
            new THREE.MeshLambertMaterial({color: new THREE.Color(i == 0 ? "#2580db" : "#db2525")})
        );
        var angle = Math.atan2((point1.y - point2.y), (point1.x - point2.x));
        wall.position.set(-(point1.x + point2.x) / 2 * mapscale, 0, (point1.y + point2.y) / 2 * mapscale);
        wall.rotation.set(0, angle, 0, "YXZ");
        startc.add(wall);
    }
    scene.add(startc);

    // Ground Plane & Outdoor Setup
    main = new THREE.Object3D();
    var ground = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(1000, 1000),
        new THREE.MeshLambertMaterial({color: new THREE.Color(0x57c115)})
    );
    ground.rotation.set(-Math.PI / 2, 0, 0);
    main.add(ground);
    scene.add(main);

    // Run string modifiers
    if(sections[4]) {
        eval(sections[4]);
    }
    LAPS = 3; // Enforce 3 Laps after execution
}

function join(){
    loadMap();
    scene.background = new THREE.Color(0x7fb0ff);

    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(0, 3, 10);
    scene.add(camera);

    var light = new THREE.DirectionalLight(0xffffff, 0.7);
    light.position.set(3000, 2000, -2000);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    if(database && code){
        me.ref = database.ref(code + "/players").push();
        me.data = {
            x: 0, y: 0, xv: 0, yv: 0, dir: 0, steer: 0,
            color: color, name: name, checkpoint: 1, lap: 1
        };
        me.ref.set(me.data);
    }

    var lastTime = performance.now();
    function render(timestamp) {
        requestAnimationFrame(render);
        var warp = (timestamp - lastTime) / 16;
        lastTime = timestamp;

        if(gameStarted && me.ref){
            me.data.dir += me.data.steer / 10 * warp;
            me.data.xv += Math.sin(me.data.dir) * SPEED * warp;
            me.data.yv += Math.cos(me.data.dir) * SPEED * warp;
            me.data.xv *= Math.pow(0.99, warp);
            me.data.yv *= Math.pow(0.99, warp);
            me.data.x += me.data.xv * warp;
            me.data.y += me.data.yv * warp;

            if(me.model){
                me.model.position.x = me.data.x;
                me.model.position.z = me.data.y;
                me.model.rotation.y = me.data.dir;
                
                // Keep Camera Centered on Local Car
                camera.position.x = me.data.x - Math.sin(me.data.dir) * 6;
                camera.position.z = me.data.y - Math.cos(me.data.dir) * 6;
                camera.position.y = 3;
                camera.lookAt(me.model.position);
            }
            me.ref.set(me.data);
        }
        renderer.render(scene, camera);
    }
    requestAnimationFrame(render);
}
