// Global State Variables
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

var app = null;
var db = null;
var auth = null;
var roomCode = "";
var playerID = "";
var playerName = "Player";
var carColor = 0;

// Initialize Firebase safely
function initFirebase() {
    if (db) return;

    var existingApp = firebase.apps && firebase.apps.find(function(a) { return a.name === 'server0'; });

    if (existingApp) {
        app = existingApp;
    } else if (typeof firebase !== 'undefined') {
        app = firebase.initializeApp(serverList[0], 'server0');
    }

    if (app) {
        db = app.database();
        auth = app.auth();

        auth.signInAnonymously().catch(function(err) {
            console.error("Firebase Auth Error:", err);
        });
    }
}

// Color Picker Drag/Click Handling
function updateColorFromEvent(e) {
    var picker = document.getElementById("colorpicker");
    if (!picker) return;
    
    var rect = picker.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var pct = Math.max(0, Math.min(1, x / rect.width));
    carColor = Math.floor(pct * 360);
    
    var slider = document.getElementById("slider");
    if (slider) {
        slider.style.left = (pct * 100) + "%";
        slider.style.backgroundColor = "hsl(" + carColor + ", 100%, 50%)";
    }
}

// Menu Transition: Main Menu -> Lobby Options
function menu2() {
    var nameInput = document.getElementById("name");
    if (nameInput && nameInput.value.trim() !== "") {
        playerName = nameInput.value.trim();
    }

    initFirebase();

    var fore = document.getElementById("fore");
    if (!fore) return;

    fore.innerHTML = `
        <div id="version">v1.2.0</div>
        <div class="title" id="title">Lobby Menu</div>
        
        <div class="menuitem title">
            <div id="start" onclick="hostGame()">Host Game</div>
        </div>

        <div class="menuitem title">
            Join Room Code:<br/>
            <input id="joincode" class="title" placeholder="CODE" style="text-transform:uppercase; margin-top:5px;" maxlength="4"><br/>
            <div id="start" style="margin-top:10px;" onclick="joinGame()">Join Room</div>
        </div>

        <div id="status" style="margin-top:15px; font-family:'Press Start 2P', cursive; font-size:12px; color:#ffcc00; text-shadow: 1px 1px 2px #000;"></div>

        <div id="toolbar">
            <div class="tools" id="edit" onclick="window.open('editor/index.html')"></div>
            <div class="tools" id="help" onclick="window.open('help/index.html')">?</div>
        </div>
    `;
}

// Host Room Logic
function hostGame() {
    var statusDiv = document.getElementById("status");
    if (statusDiv) statusDiv.innerHTML = "Creating Room...";

    if (!db) {
        if (statusDiv) statusDiv.innerHTML = "Database connecting... try again in 2s";
        initFirebase();
        return;
    }

    roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    playerID = "p1_" + Math.random().toString(36).substring(2, 6);

    var roomRef = db.ref("rooms/" + roomCode);

    roomRef.set({
        created: Date.now(),
        status: "waiting",
        players: {
            [playerID]: {
                name: playerName,
                color: carColor,
                isHost: true
            }
        }
    }).then(function() {
        showLobbyUI(true);
        listenForPlayers();
    }).catch(function(err) {
        if (statusDiv) statusDiv.innerHTML = "Error: " + err.message;
    });
}

// Join Room Logic
function joinGame() {
    var input = document.getElementById("joincode");
    var statusDiv = document.getElementById("status");
    if (!input || !input.value) {
        if (statusDiv) statusDiv.innerHTML = "Enter a 4-letter code!";
        return;
    }

    var inputCode = input.value.trim().toUpperCase();
    if (statusDiv) statusDiv.innerHTML = "Connecting...";

    if (!db) {
        initFirebase();
        return;
    }

    var roomRef = db.ref("rooms/" + inputCode);
    roomRef.once("value").then(function(snapshot) {
        if (!snapshot.exists()) {
            if (statusDiv) statusDiv.innerHTML = "Room not found!";
            return;
        }

        roomCode = inputCode;
        playerID = "p2_" + Math.random().toString(36).substring(2, 6);

        db.ref("rooms/" + roomCode + "/players/" + playerID).set({
            name: playerName,
            color: carColor,
            isHost: false
        }).then(function() {
            showLobbyUI(false);
            listenForPlayers();
        });
    }).catch(function(err) {
        if (statusDiv) statusDiv.innerHTML = "Error: " + err.message;
    });
}

// Render Room UI
function showLobbyUI(isHost) {
    var fore = document.getElementById("fore");
    if (!fore) return;

    fore.innerHTML = `
        <div id="version">v1.2.0</div>
        <div class="title">Room Code: <span id="code" style="color:#00ff00;">${roomCode}</span></div>
        
        <div id="playerlist" style="font-family:'Press Start 2P', cursive; font-size:12px; margin:20px 0; color:#fff; line-height: 1.8;">
            Connecting to player list...
        </div>

        ${isHost ? 
            '<div class="menuitem title"><div id="start" onclick="startGame()">Start Race!</div></div>' : 
            '<div style="font-family:\'Press Start 2P\', cursive; font-size:10px; color:#aaa; margin-top:10px;">Waiting for host to start...</div>'
        }
    `;
}

// Listen for Realtime Lobby Updates
function listenForPlayers() {
    if (!db) return;

    db.ref("rooms/" + roomCode + "/players").on("value", function(snapshot) {
        var players = snapshot.val();
        var listDiv = document.getElementById("playerlist");
        if (!listDiv || !players) return;

        var html = "";
        Object.keys(players).forEach(function(key) {
            var p = players[key];
            html += `<div style="color: hsl(${p.color}, 100%, 70%);">• ${p.name} ${p.isHost ? '(Host)' : ''}</div>`;
        });
        listDiv.innerHTML = html;
    });

    db.ref("rooms/" + roomCode + "/status").on("value", function(snapshot) {
        if (snapshot.val() === "playing") {
            init3DRace();
        }
    });
}

// Start Game Signal
function startGame() {
    if (db && roomCode) {
        db.ref("rooms/" + roomCode).update({ status: "playing" });
    }
}

// 3D Engine Trigger
function init3DRace() {
    var fore = document.getElementById("fore");
    if (fore) fore.style.display = "none";
    console.log("Game Start triggered for room:", roomCode);
}
