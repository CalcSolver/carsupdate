// Firebase Setup
var firebaseConfig = {
    apiKey: "AIzaSyBhBjB9cD8IDFarhBMUoG_jhL_Gl277ZG8",
    authDomain: "racing-game-67477.firebaseapp.com",
    databaseURL: "https://racing-game-67477-default-rtdb.firebaseio.com",
    projectId: "racing-game-67477",
    storageBucket: "racing-game-67477.firebasestorage.app",
    messagingSenderId: "48596697348",
    appId: "1:48596697348:web:897b9f78e511bc2f635051"
};

// Initialize Firebase safely
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

var db = firebase.database();
var auth = firebase.auth();

// Anonymous Authentication
auth.signInAnonymously().catch(function(error) {
    console.error("Auth error:", error);
});

var playerName = "Player";
var roomCode = "";

// Transition from Main Menu to Lobby
function menu2() {
    var nameInput = document.getElementById("name");
    if (nameInput && nameInput.value.trim() !== "") {
        playerName = nameInput.value.trim();
    }

    var menuContent = document.getElementById("menu-content");
    var title = document.getElementById("title");
    
    if (title) title.innerText = "Lobby";

    if (menuContent) {
        menuContent.innerHTML = `
            <div class="menuitem title">
                <div id="hostbtn" onclick="hostGame()" style="cursor:pointer; padding:10px; background:#28a745; color:#fff; margin-bottom:15px;">Host Game</div>
            </div>
            <div class="menuitem title">
                Join Game:<br/>
                <input id="joincode" class="title" placeholder="CODE" style="text-transform:uppercase; margin-top:5px; width:100px;" maxlength="4"><br/>
                <div id="joinbtn" onclick="joinGame()" style="cursor:pointer; padding:10px; background:#007bff; color:#fff; margin-top:5px; display:inline-block;">Join!</div>
            </div>
            <div id="status" style="margin-top:15px; font-size:12px; color:#ffcc00;"></div>
        `;
    }
}

// Host Room Logic
function hostGame() {
    var statusDiv = document.getElementById("status");
    if (statusDiv) statusDiv.innerHTML = "Creating Room...";

    roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    var playerID = "p1_" + Math.random().toString(36).substring(2, 6);

    db.ref("rooms/" + roomCode).set({
        created: Date.now(),
        status: "waiting",
        players: {
            [playerID]: {
                name: playerName,
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
        if (statusDiv) statusDiv.innerHTML = "Enter 4-letter code!";
        return;
    }

    var inputCode = input.value.trim().toUpperCase();
    if (statusDiv) statusDiv.innerHTML = "Connecting...";

    db.ref("rooms/" + inputCode).once("value").then(function(snapshot) {
        if (!snapshot.exists()) {
            if (statusDiv) statusDiv.innerHTML = "Room not found!";
            return;
        }

        roomCode = inputCode;
        var playerID = "p2_" + Math.random().toString(36).substring(2, 6);

        db.ref("rooms/" + roomCode + "/players/" + playerID).set({
            name: playerName,
            isHost: false
        }).then(function() {
            showLobbyUI(false);
            listenForPlayers();
        });
    }).catch(function(err) {
        if (statusDiv) statusDiv.innerHTML = "Error: " + err.message;
    });
}

// Show Room Waiting Screen
function showLobbyUI(isHost) {
    var menuContent = document.getElementById("menu-content");
    var title = document.getElementById("title");
    
    if (title) title.innerHTML = 'Room Code: <span style="color:#00ff00;">' + roomCode + '</span>';

    if (menuContent) {
        menuContent.innerHTML = `
            <div id="playerlist" style="margin:20px 0; color:#fff;">
                Waiting for players...
            </div>
            ${isHost ? 
                '<div id="startgame" onclick="startGame()" style="cursor:pointer; padding:10px; background:#28a745; color:#fff; display:inline-block;">Start Race!</div>' : 
                '<div style="font-size:10px; color:#aaa;">Waiting for host to start...</div>'
            }
        `;
    }
}

// Realtime Listener
function listenForPlayers() {
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
            var fore = document.getElementById("fore");
            if (fore) fore.style.display = "none";
            alert("Race Started!");
        }
    });
}

// Signal Start
function startGame() {
    db.ref("rooms/" + roomCode).update({ status: "playing" });
}
