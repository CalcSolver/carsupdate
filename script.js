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
        apiKey: "AIzaSyDiJsMLlix5o9XqPW1EpeBvuA15XNjlR8M",
        authDomain: "car-game-a86b9.firebaseapp.com",
        databaseURL: "https://car-game-a86b9.firebaseio.com",
        projectId: "car-game-a86b9",
        storageBucket: "car-game-a86b9.appspot.com",
        messagingSenderId: "722396856191",
        appId: "1:722396856191:web:fb5f72917856108a50e44a"
    },
    {
        apiKey: "AIzaSyCsqpn0aTDqU8ffGVE284fmSEOTK2tOgq8",
        authDomain: "car-game-backup.firebaseapp.com",
        databaseURL: "https://car-game-backup.firebaseio.com",
        projectId: "car-game-backup",
        storageBucket: "car-game-backup.appspot.com",
        messagingSenderId: "1015722732476"
    },
    {
        apiKey: "AIzaSyDNuMPH_bg8Orkndl8Md6lUh_EOS3pitGs",
        authDomain: "car-game-backup-2.firebaseapp.com",
        databaseURL: "https://car-game-backup-2-default-rtdb.firebaseio.com",
        projectId: "car-game-backup-2",
        storageBucket: "car-game-backup-2.appspot.com",
        messagingSenderId: "250860288006",
        appId: "1:250860288006:web:9df8ed3929e7fceb2d2b87"
    },
    {
        apiKey: "AIzaSyCmfz7RvzLaAo4xIxA-sH3qhXuGQZYMuvE",
        authDomain: "car-game-backup-3.firebaseapp.com",
        databaseURL: "https://car-game-backup-3-default-rtdb.firebaseio.com",
        projectId: "car-game-backup-3",
        storageBucket: "car-game-backup-3.appspot.com",
        messagingSenderId: "477326457153",
        appId: "1:477326457153:web:421821136bcc6a67f149c0"
    },
    {
        apiKey: "AIzaSyAerrEq1YUJNZnvQhZvyRa6LOS9VyhEYvs",
        authDomain: "car-game-backup-4.firebaseapp.com",
        databaseURL: "https://car-game-backup-4-default-rtdb.firebaseio.com",
        projectId: "car-game-backup-4",
        storageBucket: "car-game-backup-4.appspot.com",
        messagingSenderId: "802151922986",
        appId: "1:802151922986:web:69b9ff0ad8778d51da7253"
    },
    {
        apiKey: "AIzaSyCdVFLbMypdHR60NqXYs_qSpAdvvgpo9Ig",
        authDomain: "car-game-backup-5.firebaseapp.com",
        databaseURL: "https://car-game-backup-5-default-rtdb.firebaseio.com",
        projectId: "car-game-backup-5",
        storageBucket: "car-game-backup-5.appspot.com",
        messagingSenderId: "743331533949",
        appId: "1:743331533949:web:a724977f309c1583400d14"
    },
    {
        apiKey: "AIzaSyDRmEJMfrk_y1-BLjgaD6ctaDfP8tKSyfA",
        authDomain: "car-game-backup-6.firebaseapp.com",
        databaseURL: "https://car-game-backup-6-default-rtdb.firebaseio.com",
        projectId: "car-game-backup-6",
        storageBucket: "car-game-backup-6.appspot.com",
        messagingSenderId: "1025140224576",
        appId: "1:1025140224576:web:cb239ab3773cb7596125a5"
    },
    {
        apiKey: "AIzaSyA1y6TdFz2F0oahE-HmkA0mTAROlgIytR4",
        authDomain: "car-game-backup-7.firebaseapp.com",
        databaseURL: "https://car-game-backup-7-default-rtdb.firebaseio.com",
        projectId: "car-game-backup-7",
        storageBucket: "car-game-backup-7.appspot.com",
        messagingSenderId: "1012238241918",
        appId: "1:1012238241918:web:d4188393dcd596b6a6882f"
    }
];

var database, connectedN = -1, connectedS = undefined;
for (var i = 0; i < serverList.length; i++) {
    firebase.initializeApp(serverList[i], "server" + i);
    let li = i;
    let la = firebase.apps[i];
    if (i == 0) {
        try {
            la.analytics();
        } catch {}
    }
    let tm = setTimeout(function() {
        la.delete();
    }, 5000);
    la.auth().signInAnonymously().then(() => {
        database = la.database();
        database.ref("/testServer").once("value", function(e) {
            clearTimeout(tm);
            if (connectedN >= 0 && connectedN > li)
                connectedS.delete();
            if (connectedN < 0 || connectedN > li) {
                database = la.database();
                connectedN = li;
                connectedS = la;
            } else {
                la.delete();
            }
        }, function(e) {
            la.delete();
        });
    }, function(e) {
        la.delete();
    });
}

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

var camera, renderer, scene, renderer2, scene2, labels = [];
scene = new THREE.Scene();
renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
var mobile = navigator.userAgent.match("Mobile") != null || navigator.userAgent.match("Linux;") != null;
if (!mobile) {
    renderer.shadowMap.enabled = false;
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.needsUpdate = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    if (document.getElementById("cardboard")) document.getElementById("cardboard").className += " disabled";
}
var element = renderer.domElement;

function toggleFullScreen() {
    var doc = window.document;
    var docEl = doc.documentElement;

    var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
    var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

    if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
        requestFullScreen.call(docEl);
    } else {
        cancelFullScreen.call(doc);
    }
    window.scrollTo(0, 1);
}

var name, code, players = {}, me = {}, gameStarted = false, gameSortaStarted = false, left = false, right = false, lap;
var carPos = [
    {x: 0, y: 0}, {x: 2, y: 0}, {x: -2, y: 0},
    {x: 0, y: -3}, {x: -2, y: -3}, {x: 2, y: -3},
    {x: 0, y: -6}, {x: 2, y: -6}, {x: -2, y: -6},
    {x: 0, y: -9}, {x: 2, y: -9}, {x: -2, y: -9},
    {x: 0, y: -12}, {x: -2, y: -12}, {x: 2, y: -12},
    {x: 0, y: -15}, {x: 2, y: -15}, {x: -2, y: -15}
];
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
    if (mobile) {
        function reactOrientation(e) {
            var angle = screen.orientation.type == "portrait-primary" ? e.gamma : screen.orientation.type == "portrait-secondary" ? -e.gamma : screen.orientation.type == "landscape-primary" ? e.beta : screen.orientation.type == "landscape-secondary" ? -e.beta : 0;
            if (me.data) me.data.steer = Math.max(Math.min((-angle) / 180 * Math.PI, Math.PI / 6), -Math.PI / 6);
        }

        if (window.DeviceOrientationEvent && DeviceOrientationEvent.requestPermission) {
            DeviceOrientationEvent.requestPermission("The game needs to access phone tilt so you can steer your car.").then(permissionState => {
                if (permissionState === 'granted')
                    window.addEventListener('deviceorientation', reactOrientation);
                else
                    alert("Permission denied");
            }).catch(alert);
        } else {
            window.addEventListener('deviceorientation', reactOrientation);
        }
    }
    if (document.getElementById("name").value == "")
        name = "Nerd with No Name";
    else
        name = document.getElementById("name").value;
    VR = document.getElementById("cardboard") ? document.getElementById("cardboard").className == "tools sel" : false;
    f.style.transform = "translate3d(0, -100vh, 0)";
    setTimeout(function() {
        f.innerHTML = "<div class='menuitem title button' id='host' ontouchstart='this.click()' onclick='host()'>Host a game</div><div class='menuitem title button' ontouchstart='this.click()' id='join' onclick='joinGame()'>Join a game</div>";
        f.style.transform = "none";
        setTimeout(function() {
            if (document.getElementById("host")) {
                document.getElementById("host").style.transform = "none";
                setTimeout(function() {
                    document.getElementById("host").style.transition = "transform .2s, box-shadow .2s";
                }, 500);
            }
        }, 500);
        setTimeout(function() {
            if (document.getElementById("join")) {
                document.getElementById("join").style.transform = "none";
                setTimeout(function() {
                    document.getElementById("join").style.transition = "transform .2s, box-shadow .2s";
                }, 500);
            }
        }, 1000);
    }, 500);
}

var host = function() {
    document.getElementById("host").onclick = null;
    f.style.transform = "translate3d(0, -100vh, 0)";
    setTimeout(function() {
        f.innerHTML = "<div class='info title'>Use this code to join the game!<div id='code'>Loading...</div></div><div id='startgame' class='title' onclick='startGame()' ontouchstart='this.click()'>Start!</div>";
        if (VR) f.innerHTML += "<div id='divider'></div>";
        f.appendChild(element);
        f.style.transform = "none";
        getCode();
    }, 1000);

    function getCode() {
        code = "";
        var letters = "ABCDEFGHIJKLMMNOPQRSTUVWXYZ";
        for (var i = 0; i < 4; i++)
            code += letters[Math.floor(Math.random() * letters.length)];
        database.ref(code).once("value", function(codeCheck) {
            if (codeCheck.val() == null || codeCheck.val().status == -1 || !codeCheck.val().timestamp || Date.now() - codeCheck.val().timestamp > 1000 * 60 * 60 * 24) {
                document.getElementById("code").innerHTML = code;

                database.ref(code).set({
                    status: 0,
                    players: {},
                    map: document.getElementById("trackcode").innerHTML,
                    timestamp: Date.now()
                });

                database.ref(code + "/players").on("child_added", function(p) {
                    players[p.ref_.path.pieces_[2]] = {
                        data: p.val(),
                        model: new THREE.Mesh(new THREE.BoxBufferGeometry(1, 1, 2))
                    };
                    var pl = players[p.ref_.path.pieces_[2]];
                    pl.model.position.set(pl.data.x, 0.6, pl.data.y);
                    pl.model.material = new THREE.MeshLambertMaterial({color: new THREE.Color("hsl(" + pl.data.color + ", 100%, 50%)")});
                    var wheel = new THREE.Mesh(
                        new THREE.CylinderBufferGeometry(0.5, 0.5, 0.2, 10),
                        new THREE.MeshLambertMaterial({color: new THREE.Color("#222")})
                    );
                    var w1 = wheel.clone();
                    w1.position.set(0.6, -0.1, 0.7);
                    w1.rotation.set(Math.PI / 2, 0, Math.PI / 2);
                    pl.model.add(w1);
                    var w2 = wheel.clone();
                    w2.position.set(-0.6, -0.1, 0.7);
                    w2.rotation.set(Math.PI / 2, 0, Math.PI / 2);
                    pl.model.add(w2);
                    var w3 = wheel.clone();
                    w3.position.set(0.6, -0.1, -0.7);
                    w3.rotation.set(Math.PI / 2, 0, Math.PI / 2);
                    pl.model.add(w3);
                    var w4 = wheel.clone();
                    w4.position.set(-0.6, -0.1, -0.7);
                    w4.rotation.set(Math.PI / 2, 0, Math.PI / 2);
                    pl.model.add(w4);
                    var label = document.createElement("DIV");
                    label.className = "label";
                    label.innerHTML = pl.data.name.replaceAll("<", "&lt;") + "<br/>|";
                    pl.label = label;
                    label.position = pl.model.position;
                    f.appendChild(label);
                    labels.push(label);
                    pl.model.receiveShadow = true;
                    scene.add(pl.model);

                    if (p.ref_.path.pieces_[2] == me.ref.path.pieces_[2]) {
                        me.label = pl.label;
                        me.model = pl.model;
                        me.label.innerHTML = "";
                    }
                });

                database.ref(code + "/players").on("child_changed", function(p) {
                    players[p.ref_.path.pieces_[2]].data = p.val();
                });

                me.ref = database.ref(code + "/players").push();
                me.data = {
                    x: 0,
                    y: 0,
                    xv: 0,
                    yv: 0,
                    dir: 0,
                    steer: 0,
                    color: color,
                    name: name,
                    checkpoint: 1,
                    lap: 0,
                    collision: {}
                };
                me.ref.set(me.data);

                database.ref(code + "/status").on("value", function(v) {
                    v = v.val();
                    if (v == 1) {
                        if (document.getElementsByClassName("info")[0]) document.getElementsByClassName("info")[0].outerHTML = "";
                        if (document.getElementById("startgame")) document.getElementById("startgame").outerHTML = "";

                        gameStarted = true;
                        gameSortaStarted = true;

                        var countDown = document.createElement("DIV");
                        countDown.innerHTML = "3";
                        countDown.className = "title";
                        countDown.id = "countdown";
                        f.appendChild(countDown);

                        lap = document.createElement("DIV");
                        lap.innerHTML = "1/" + LAPS;
                        lap.className = "title";
                        lap.id = "lap";
                        f.appendChild(lap);

                        setTimeout(function() { countDown.innerHTML = "2"; }, 1000);
                        setTimeout(function() { countDown.innerHTML = "1"; }, 2000);
                        setTimeout(function() { countDown.innerHTML = "GO!"; gameSortaStarted = false; }, 3000);
                        setTimeout(function() { countDown.innerHTML = ""; }, 4000);
                    }
                });
            } else {
                getCode();
            }
        });
    }

    join();
}

var joinGame = function() {
    document.getElementById("join").onclick = null;
    f.style.transform = "translate3d(0, -100vh, 0)";
    setTimeout(function() {
        f.innerHTML = "<div class='info title'>Enter a code to join a game!<input id='incode' class='title' onkeyup='codeCheck(event)' ontouchstart='this.focus()'></input></div>";
        if (VR) f.innerHTML += "<div id='divider'></div>";
        f.appendChild(element);
        f.style.transform = "none";
    }, 1000);
    join();
}

var map, trees, signs, startc, main;

function deleteMap() {
    while (map.children.length > 0) map.remove(map.children[0]);
    scene.remove(map);
    while (trees.children.length > 0) trees.remove(trees.children[0]);
    scene.remove(trees);
    while (signs.children.length > 0) signs.remove(signs.children[0]);
    scene.remove(signs);
    while (startc.children.length > 0) startc.remove(startc.children[0]);
    scene.remove(startc);
    while (main.children.length > 0) main.remove(main.children[0]);
    scene.remove(main);
}

function loadMap() {
    var racedata = document.getElementById("trackcode").innerHTML.trim().split("|")[0].trim().split(" ");
    var material = new THREE.MeshLambertMaterial({color: new THREE.Color(0xf48342)});
    map = new THREE.Object3D();
    for (var i = 0; i < racedata.length; i++) {
        if (racedata[i] == "") continue;
        var point1 = new THREE.Vector2(parseInt(racedata[i].split("/")[0].split(",")[0]), parseInt(racedata[i].split("/")[0].split(",")[1]));
        var point2 = new THREE.Vector2(parseInt(racedata[i].split("/")[1].split(",")[0]), parseInt(racedata[i].split("/")[1].split(",")[1]));
        var wall = new THREE.Mesh(
            new THREE.BoxBufferGeometry(point1.distanceTo(point2) * mapscale + 0.3, 1.5, 0.3),
            material
        );
        var angle = Math.atan2((point1.y - point2.y), (point1.x - point2.x));
        wall.position.set(-(point1.x + point2.x) / 2 * mapscale, 0.75, (point1.y + point2.y) / 2 * mapscale);
        wall.rotation.set(0, angle, 0, "YXZ");
        var plane = new THREE.Plane(new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle));
        wall.plane = plane;
        wall.width = point1.distanceTo(point2) * mapscale;
        wall.p1 = point1.multiply(new THREE.Vector2(-mapscale, mapscale));
        wall.p2 = point2.multiply(new THREE.Vector2(-mapscale, mapscale));
        wall.castShadow = true;
        wall.receiveShadow = true;
        map.add(wall);
    }
    scene.add(map);

    trees = new THREE.Object3D();
    var tree = new THREE.Mesh(
        new THREE.CylinderBufferGeometry(0, 4, 15),
        new THREE.MeshLambertMaterial({color: new THREE.Color("#1bad2c")})
    );
    var treedata = document.getElementById("trackcode").innerHTML.trim().split("|")[2].trim().split(" ");
    for (var i = 0; i < treedata.length; i++) {
        if (treedata[i] == "") continue;
        var t = tree.clone();
        t.position.set(-parseInt(treedata[i].split(",")[0]) * mapscale, 0, parseInt(treedata[i].split(",")[1]) * mapscale);
        var s = Math.random() + 1;
        t.scale.set(s, s, s);
        t.castShadow = true;
        t.receiveShadow = true;
        trees.add(t);
    }
    scene.add(trees);

    signs = new THREE.Object3D();
    var sign = new THREE.Mesh(
        new THREE.ConeBufferGeometry(0.7, 2, 5),
        new THREE.MeshLambertMaterial({color: new THREE.Color("#f00")})
    );
    var signdata = document.getElementById("trackcode").innerHTML.trim().split("|")[3].trim().split(" ");
    for (var i = 0; i < signdata.length; i++) {
        if (signdata[i] == "") continue;
        var s = sign.clone();
        var da = signdata[i].split("/");
        s.position.set(-parseFloat(da[0].split(",")[0]) * mapscale, parseFloat(da[0].split(",")[1]) + 1, parseFloat(da[0].split(",")[2]) * mapscale);
        s.rotation.set(Math.PI / 2, parseInt(da[1]) / 180 * Math.PI, 0, "YXZ");
        s.castShadow = true;
        s.receiveShadow = true;
        signs.add(s);
    }
    scene.add(signs);

    var startdata = document.getElementById("trackcode").innerHTML.trim().split("|")[1].trim().split(" ");
    startc = new THREE.Object3D();
    for (var i = 0; i < startdata.length; i++) {
        if (startdata[i] == "") continue;
        var point1 = new THREE.Vector2(parseInt(startdata[i].split("/")[0].split(",")[0]), parseInt(startdata[i].split("/")[0].split(",")[1]));
        var point2 = new THREE.Vector2(parseInt(startdata[i].split("/")[1].split(",")[0]), parseInt(startdata[i].split("/")[1].split(",")[1]));
        var wall = new THREE.Mesh(
            new THREE.BoxBufferGeometry(point1.distanceTo(point2) * mapscale, 0.1, 1),
            new THREE.MeshLambertMaterial({color: new THREE.Color(i == 0 ? "#2580db" : "#db2525")})
        );
        var angle = Math.atan2((point1.y - point2.y), (point1.x - point2.x));
        wall.position.set(-(point1.x + point2.x) / 2 * mapscale, 0, (point1.y + point2.y) / 2 * mapscale);
        wall.rotation.set(0, angle, 0, "YXZ");
        var plane = new THREE.Plane(new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle));
        wall.plane = plane;
        wall.width = point1.distanceTo(point2) * mapscale;
        wall.castShadow = true;
        wall.receiveShadow = true;
        startc.add(wall);
    }
    scene.add(startc);

    main = new THREE.Object3D();
    var stripes = new THREE.TextureLoader().load("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAEklEQVQYV2NgYGD4z/D/////AA/6BPwHejn9AAAAAElFTkSuQmCC");
    stripes.magFilter = THREE.NearestFilter;
    stripes.wrapS = THREE.RepeatWrapping;
    stripes.wrapT = THREE.RepeatWrapping;
    stripes.repeat.set(100, 100);
    var ground = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(1000, 1000),
        new THREE.MeshLambertMaterial({color: new THREE.Color(0x57c115), emissive: new THREE.Color(0x0f0f0f), emissiveMap: stripes})
    );
    ground.rotation.set(-Math.PI / 2, 0, 0);
    ground.receiveShadow = true;
    main.add(ground);

    for (var i = 0; i < 100; i++) {
        var cube = new THREE.Mesh(
            new THREE.BoxBufferGeometry(100, 100, 100),
            new THREE.MeshLambertMaterial({color: new THREE.Color("#888"), side: THREE.DoubleSide})
        );
        var dist = Math.random() * MOUNTAIN_DIST + MOUNTAIN_DIST;
        var dir = Math.random() * Math.PI * 2;
        cube.position.set(dist * Math.sin(dir), 0, dist * Math.cos(dir));
        cube.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
        main.add(cube);
    }
    scene.add(main);

    return document.getElementById("trackcode").innerText.trim().split("|")[4];
}

function join() {
    eval(loadMap());

    scene.background = new THREE.Color(0x7fb0ff);

    camera = new THREE.PerspectiveCamera(
        90,
        window.innerWidth / window.innerHeight,
        1,
        1000
    );

    camera.position.set(0, 3, 10);
    scene.add(camera);

    var player = new THREE.Object3D();
    player.position.set(0, 0, 0);

    camera.lookAt(player.position);
    scene.add(player);

    var light = new THREE.DirectionalLight(0xffffff, 0.7);
    light.position.set(3000, 2000, -2000);
    light.castShadow = true;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.near = 3000;
    light.shadow.camera.far = 5000;
    light.shadow.camera.top = 100;
    light.shadow.camera.bottom = -100;
    light.shadow.camera.left = -100;
    light.shadow.camera.right = 120;
    light.shadow.bias = 0.00002;
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    var ray = new THREE.Raycaster();
    ray.near = 0;
    ray.far = 1;

    var ren = renderer;
    var controls;
    if (VR) {
        var effect = new THREE.StereoEffect(renderer);
        effect.setSize(window.innerWidth, window.innerHeight);
        effect.setEyeSeparation(0.7);
        ren = effect;
        controls = new THREE.DeviceOrientationControls(camera);
    }

    var lastTime = performance.now();
    function render(timestamp) {
        requestAnimationFrame(render);
        var timepassed = timestamp - lastTime;
        lastTime = timestamp;
        var warp = timepassed / 16;

        if (gameStarted) {
            if (!mobile) {
                if (left) me.data.steer = Math.PI / 6;
                if (right) me.data.steer = -Math.PI / 6;
                if (!(left ^ right)) me.data.steer = 0;
            }
            if (VR) me.data.steer = camera.rotation.z;
            me.data.steer = Math.max(-Math.PI / 6, Math.min(Math.PI / 6, me.data.steer));

            if (me.ref && players[me.ref.path.pieces_[2]]) {
                players[me.ref.path.pieces_[2]].data = me.data;
            }

            if (!gameSortaStarted) {
                for (var p in players) {
                    var play = players[p];

                    play.data.dir += play.data.steer / 10 * warp;

                    play.data.xv += Math.sin(play.data.dir) * SPEED * warp;
                    play.data.yv += Math.cos(play.data.dir) * SPEED * warp;

                    play.data.xv *= Math.pow(0.99, warp);
                    play.data.yv *= Math.pow(0.99, warp);

                    play.data.x += play.data.xv * warp;
                    play.data.y += play.data.yv * warp;

                    play.model.position.x = play.data.x + play.data.xv;
                    play.model.position.z = play.data.y + play.data.yv;
                    play.model.rotation.y = play.data.dir;

                    if (play.model.children[0]) play.model.children[0].rotation.z = Math.PI / 2 - play.data.steer;
                    if (play.model.children[1]) play.model.children[1].rotation.z = Math.PI / 2 - play.data.steer;

                    for (var w in map.children) {
                        var wall = map.children[w];
                        var posi = new THREE.Vector2(play.data.x, play.data.y);
                        if (Math.abs(wall.plane.distanceToPoint(play.model.position.clone().sub(wall.position))) < WALL_SIZE) {
                            if (wall.position.clone().distanceTo(play.model.position) < wall.width / 2) {
                                var vel = new THREE.Vector3(play.data.xv, 0, play.data.yv);
                                vel.reflect(wall.plane.normal);
                                play.data.xv = vel.x + BOUNCE_CORRECT * wall.plane.normal.x * Math.sign(wall.plane.normal.dot(play.model.position.clone().sub(wall.position)));
                                play.data.yv = vel.z + BOUNCE_CORRECT * wall.plane.normal.z * Math.sign(wall.plane.normal.dot(play.model.position.clone().sub(wall.position)));
                                
                                while (Math.abs(wall.plane.distanceToPoint(new THREE.Vector3(play.data.x, 0, play.data.y).sub(wall.position))) < WALL_SIZE) {
                                    play.data.x += play.data.xv;
                                    play.data.y += play.data.yv;
                                }
                                play.data.xv *= BOUNCE;
                                play.data.yv *= BOUNCE;
                            }
                        }
                        if (posi.distanceTo(wall.p1) < WALL_SIZE + 0.1) {
                            play.data.xv *= -BOUNCE;
                            play.data.yv *= -BOUNCE;
                        }
                    }
                }
            }
        }

        if (VR && controls) {
            controls.update();
        }

        ren.render(scene, camera);
    }
    requestAnimationFrame(render);
}
