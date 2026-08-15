// Firebase Server Configuration
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

// Safe Firebase Initialization (Fixes app-deleted crash)
function initFirebaseServer() {
    if (db) return;

    try {
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
                console.warn("Auth warning:", err);
            });
        }
    } catch(e) {
        console.error("Firebase connection error:", e);
    }
}

// Color Picker Drag/Click Handler
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

// Menu Transition: Main Menu -> Options
function menu2() {
    var nameInput = document.getElementById("name");
    if (nameInput && nameInput.value.trim() !== "") {
        playerName = nameInput.value.trim();
    }

    // Connect to Firebase
    initFirebaseServer();

    var menuContent = document.getElementById("menu-content");
    var title = document.getElementById("title");
    
    if (title) title.innerText = "Multiplayer";

    if (menuContent) {
        menuContent.innerHTML = `
            <div class="menuitem title">
                <div id="start" onclick="hostGame()">Host Game</div>
            </div>
            <div class="menuitem title" style="margin-top:20px;">
                Or Enter Code to Join:<br/>
                <input id="joincode" class="title" placeholder="CODE" style="text-transform:uppercase; margin-top:5px;" maxlength="4"><br/>
                <div id="start" style="margin-top:10px;" onclick="joinGame()">Join Room</div>
            </div>
            <div id="status" style="margin-top:15px; font-size:10px; color:#ff0000;"></div>
        `;
    }
}

// Host Room Logic (Fixes Endless Loading)
function hostGame() {
    var title = document.getElementById("title");
    if (title) title.innerText = "Creating Room...";

    roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    playerID = "p1_" + Math.random().toString(36).substring(2, 6);

    // Timeout safety net: If Firebase hangs, force room code creation anyway
    var hasLoaded = false;
    var loadTimeout = setTimeout(function() {
        if (!hasLoaded) {
            showLobbyUI(true);
            var statusDiv = document.getElementById("status");
            if (statusDiv) statusDiv.innerText = "Running in Offline Mode";
        }
    }, 2500);

    if (db) {
        db.ref("rooms/" + roomCode).set({
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
            hasLoaded = true;
            clearTimeout(loadTimeout);
            showLobbyUI(true);
            listenForPlayers();
        }).catch(function(err) {
            console.error(err);
        });
    }
}

// Join Room Logic
function joinGame() {
    var input = document.getElementById("joincode");
    var statusDiv = document.getElementById("status");
    if (!input || !input.value) {
        if (statusDiv) statusDiv.innerText = "Enter a code first!";
        return;
    }

    var inputCode = input.value.trim().toUpperCase();
    if (statusDiv) statusDiv.innerText = "Connecting...";

    if (!db) {
        if (statusDiv) statusDiv.innerText = "Server unreachable";
        return;
    }

    db.ref("rooms/" + inputCode).once("value").then(function(snapshot) {
        if (!snapshot.exists()) {
            if (statusDiv) statusDiv.innerText = "Room Not Found!";
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
        if (statusDiv) statusDiv.innerText = "Error joining room";
    });
}

// Display Lobby Room Code
function showLobbyUI(isHost) {
    var menuContent = document.getElementById("menu-content");
    var title = document.getElementById("title");
    
    if (title) title.innerHTML = 'Room: <span style="color:#008800;">' + roomCode + '</span>';

    if (menuContent) {
        menuContent.innerHTML = `
            <div id="playerlist" style="margin:20px 0; font-size:12px;">
                <div>• ${playerName} (You)</div>
            </div>
            ${isHost ? 
                '<div class="menuitem title"><div id="start" onclick="startGame()">Start Race!</div></div>' : 
                '<div style="font-size:10px; color:#666;">Waiting for host to start...</div>'
            }
            <div id="status" style="margin-top:10px; font-size:10px; color:#888;"></div>
        `;
    }
}

// Listen for Other Players & Game Signals
function listenForPlayers() {
    if (!db) return;

    db.ref("rooms/" + roomCode + "/players").on("value", function(snapshot) {
        var players = snapshot.val();
        var listDiv = document.getElementById("playerlist");
        if (!listDiv || !players) return;

        var html = "";
        Object.keys(players).forEach(function(key) {
            var p = players[key];
            html += `<div>• ${p.name} ${p.isHost ? '(Host)' : ''}</div>`;
        });
        listDiv.innerHTML = html;
    });

    db.ref("rooms/" + roomCode + "/status").on("value", function(snapshot) {
        if (snapshot.val() === "playing") {
            init3DRace();
        }
    });
}

// Trigger Race Start
function startGame() {
    if (db && roomCode) {
        db.ref("rooms/" + roomCode).update({ status: "playing" });
    } else {
        init3DRace();
    }
}

// Hide menu screen and start 3D environment
function init3DRace() {
    var fore = document.getElementById("fore");
    if (fore) fore.style.display = "none";
    console.log("Starting 3D race engine for room:", roomCode);
}
