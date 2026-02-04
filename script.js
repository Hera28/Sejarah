import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, onValue, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// 1. KONFIGURASI DATABASE
const firebaseConfig = {
    apiKey: "AIzaSyAclyNf8Dy69UD0X9IwuNo4QH3BfAzmfZY",
    authDomain: "sejarah-game.firebaseapp.com",
    databaseURL: "https://sejarah-game-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "sejarah-game",
    storageBucket: "sejarah-game.firebasestorage.app",
    messagingSenderId: "1045111080150",
    appId: "1:1045111080150:web:5c065dec17c5902c03f577",
    measurementId: "G-51CDWMY21F"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 2. STATE APLIKASI
let player = {
    id: "",
    name: "",
    m: 50, // Moral
    l: 50, // Logistik
    s: 50, // Support Internasional
    currentMission: 0,
    lastAnswer: ""
};

// 3. FUNGSI NAVIGASI (Internal)
function showScreen(id) {
    document.querySelectorAll("section").forEach(s => s.classList.add("hidden"));
    const target = document.getElementById(id);
    if (target) target.classList.remove("hidden");
}

// 4. LOGIKA REGISTRASI MURID
const btnReg = document.getElementById("btn-reg");
if (btnReg) {
    btnReg.addEventListener("click", () => {
        const nameInput = document.getElementById("in-name").value.trim().toUpperCase();
        
        if (!nameInput) {
            alert("KOMANDAN! Masukkan identitas Anda (Nama & No Absen)!");
            return;
        }

        // Generate ID unik agar data tidak tertimpa
        player.id = nameInput.replace(/\s+/g, "_") + "_" + Math.floor(1000 + Math.random() * 9000);
        player.name = nameInput;

        // Simpan ke Firebase
        set(ref(db, "players/" + player.id), player)
            .then(() => {
                console.log("Data Komandan tersimpan di Markas.");
                showScreen("scr-wait");
                startListeningToGameStatus();
            })
            .catch((err) => alert("Koneksi Markas Terputus: " + err.message));
    });
}

// 5. OTORITAS ADMIN (GURU)
const linkAdmin = document.getElementById("link-admin");
if (linkAdmin) {
    linkAdmin.addEventListener("click", (e) => {
        e.preventDefault();
        const pw = prompt("Masukkan Kode Otoritas Guru:");
        if (pw === "sejarah123") {
            showScreen("scr-admin");
            setupAdminMonitor();
        } else {
            alert("AKSES DITOLAK! Anda bukan otoritas pusat.");
        }
    });
}

// 6. SINKRONISASI GAME (Murid menunggu perintah Guru)
function startListeningToGameStatus() {
    const statusRef = ref(db, "gameConfig/status");
    onValue(statusRef, (snapshot) => {
        const status = snapshot.val();
        if (status === "STARTED") {
            showScreen("scr-game");
            // Load misi pertama di sini nanti
        }
    });
}

// 7. MONITORING ADMIN (Live Dashboard)
function setupAdminMonitor() {
    const playersRef = ref(db, "players");
    onValue(playersRef, (snapshot) => {
        const data = snapshot.val();
        const monitorBody = document.getElementById("monitor-body");
        if (!monitorBody) return;

        monitorBody.innerHTML = "";
        for (let id in data) {
            const p = data[id];
            const stabilitas = Math.round((p.m + p.l + p.s) / 3);
            monitorBody.innerHTML += `
                <tr>
                    <td>${p.name}</td>
                    <td>Misi ${p.currentMission || 0}</td>
                    <td>${stabilitas}%</td>
                    <td>${p.lastAnswer || "-"}</td>
                </tr>
            `;
        }
    });
}

// 8. TOMBOL START GURU
const btnStart = document.getElementById("btn-start");
if (btnStart) {
    btnStart.addEventListener("click", () => {
        update(ref(db, "gameConfig"), { status: "STARTED" });
        alert("MISI DIMULAI! Semua layar murid akan berubah.");
    });
}
