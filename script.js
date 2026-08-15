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

// Color Picker Handling
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

// Menu Transition (Reuses existing layout elements to preserve CSS styling)
function menu2() {
    var nameInput = document.getElementById("name");
    if (nameInput && nameInput.value.trim() !== "") {
        playerName = nameInput.value.trim();
    }

    initFirebase();

    // Change title text
    var title = document.getElementById("title");
    if (title) title.innerText = "Multiplayer Lobby";

    // Change input box to accept Room Code
    if (nameInput) {
        nameInput.value = "";
        nameInput.placeholder = "Enter Code (Optional)";
        nameInput.style.textTransform = "uppercase";
    }

    // Reuse Start button for Host/Join actions
    var startBtn = document.getElementById("start");
    if (startBtn) {
        startBtn.innerText = "Host or Join Game";
        startBtn.onclick = function() {
            var inputCode = nameInput ? nameInput.value.trim().toUpperCase() : "";
            if (inputCode.length > 0) {
                joinGame(inputCode);
            } else {
                hostGame();
            }
        };
    }
}

// Host Room Logic
function hostGame() {
    var title = document.getElementById("title");
    if (title) title.innerText = "Creating Room...";

    if (!db) {
        initFirebase();
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
        showRoomCodeUI(true);
        listenForPlayers();
    }).catch(function(err) {
        if (title) title.innerText = "Error: " + err.message;
    });
}

// Join Room Logic
function joinGame(inputCode) {
    var title = document.getElementById("title");
    if (title) title.innerText = "Connecting...";

    if (!db) {
        initFirebase();
    }

    var roomRef = db.ref("rooms/" + inputCode);
    roomRef.once("value").then(function(snapshot) {
        if (!snapshot.exists()) {
            if (title) title.innerText = "Room Not Found!";
            return;
        }

        roomCode = inputCode;
        playerID = "p2_" + Math.random().toString(36).substring(2, 6);

        db.ref("rooms/" + roomCode + "/players/" + playerID).set({
            name: playerName,
            color: carColor,
            isHost: false
        }).then(function() {
            showRoomCodeUI(false);
            listenForPlayers();
        });
    }).catch(function(err) {
        if (title) title.innerText = "Error: " + err.message;
    });
}

// Displays Room Code in Title
function showRoomCodeUI(isHost) {
    var title = document.getElementById("title");
    if (title) title.innerText = "Room: " + roomCode;

    var startBtn = document.getElementById("start");
    if (startBtn) {
        if (isHost) {
            startBtn.innerText = "Start Race!";
            startBtn.onclick = startGame;
        } else {
            startBtn.innerText = "Waiting for Host...";
            startBtn.onclick = null;
        }
    }
}

// Listen for Room State Updates
function listenForPlayers() {
    if (!db) return;

    db.ref("rooms/" + roomCode + "/status").on("value", function(snapshot) {
        if (snapshot.val() === "playing") {
            init3DRace();
        }
    });
}

// Trigger Start Signal
function startGame() {
    if (db && roomCode) {
        db.ref("rooms/" + roomCode).update({ status: "playing" });
    }
}

// Hide menu and enter 3D scene
function init3DRace() {
    var fore = document.getElementById("fore");
    if (fore) fore.style.display = "none";
    console.log("Race Started in Room:", roomCode);
}
