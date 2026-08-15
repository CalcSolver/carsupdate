// Global Setup
var playerName = "Player";
var carColor = 0;
var roomCode = "";
var db = null;

// Initialize Firebase safely on page load
window.addEventListener("DOMContentLoaded", function () {
    if (typeof firebase !== "undefined" && !firebase.apps.length) {
        try {
            firebase.initializeApp({
                apiKey: "AIzaSyBhBjB9cD8IDFarhBMUoG_jhL_Gl277ZG8",
                authDomain: "racing-game-67477.firebaseapp.com",
                databaseURL: "https://racing-game-67477-default-rtdb.firebaseio.com",
                projectId: "racing-game-67477",
                storageBucket: "racing-game-67477.firebasestorage.app",
                messagingSenderId: "48596697348",
                appId: "1:48596697348:web:897b9f78e511bc2f635051"
            });
            db = firebase.database();
            firebase.auth().signInAnonymously();
        } catch (e) {
            console.error("Firebase Init Error:", e);
        }
    }
});

// Start button trigger (called directly from index.html)
function menu2() {
    var nameInput = document.getElementById("name");
    if (nameInput && nameInput.value.trim() !== "") {
        playerName = nameInput.value.trim();
    }

    var title = document.getElementById("title");
    var startBtn = document.getElementById("start");

    // Check if code was typed into the name input box
    var enteredCode = nameInput ? nameInput.value.trim().toUpperCase() : "";

    if (enteredCode.length === 4) {
        // Join Game Mode
        if (title) title.innerText = "Joining " + enteredCode + "...";
        joinRoom(enteredCode);
    } else {
        // Host Game Mode
        if (title) title.innerText = "Creating Room...";
        hostRoom();
    }
}

// Host Room Logic
function hostRoom() {
    roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    var title = document.getElementById("title");
    var startBtn = document.getElementById("start");

    if (!db) {
        if (title) title.innerText = "Room Code: " + roomCode + " (Offline)";
        return;
    }

    db.ref("rooms/" + roomCode).set({
        created: Date.now(),
        status: "waiting",
        host: playerName
    }).then(function () {
        if (title) title.innerText = "Room: " + roomCode;
        if (startBtn) {
            startBtn.innerText = "Start Race!";
            startBtn.onclick = function () {
                db.ref("rooms/" + roomCode).update({ status: "playing" });
            };
        }
        listenForStart();
    }).catch(function (err) {
        if (title) title.innerText = "Error connecting to server";
        console.error(err);
    });
}

// Join Room Logic
function joinRoom(code) {
    var title = document.getElementById("title");
    var startBtn = document.getElementById("start");

    if (!db) return;

    db.ref("rooms/" + code).once("value").then(function (snapshot) {
        if (!snapshot.exists()) {
            if (title) title.innerText = "Room Not Found!";
            return;
        }

        roomCode = code;
        if (title) title.innerText = "Joined Room: " + roomCode;
        if (startBtn) {
            startBtn.innerText = "Waiting for Host...";
            startBtn.onclick = null;
        }
        listenForStart();
    });
}

// Listen for race launch
function listenForStart() {
    if (!db || !roomCode) return;

    db.ref("rooms/" + roomCode + "/status").on("value", function (snapshot) {
        if (snapshot.val() === "playing") {
            var fore = document.getElementById("fore");
            if (fore) fore.style.display = "none";
            alert("Race Started!");
        }
    });
}
