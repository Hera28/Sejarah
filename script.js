import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, update, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAclyNf8Dy69UD0X9IwuNo4QH3BfAzmfZY",
    authDomain: "sejarah-game.firebaseapp.com",
    databaseURL: "https://sejarah-game-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "sejarah-game",
    storageBucket: "sejarah-game.firebasestorage.app",
    messagingSenderId: "1045111080150",
    appId: "1:1045111080150:web:5c065dec17c5902c03f577"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Data 35 Misi (Contoh 3 Pertama)
const missions = [
    { title: "Runtuhnya Singasari", era: "1293", desc: "Jayakatwang menyerang. Raden Wijaya ditawarkan aliansi oleh Mongol. Terima?", opt1: "Terima Mongol", opt2: "Gerilya Mandiri", m: [10, -20], l: [30, -10], s: [20, -5] },
    { title: "Sumpah Palapa", era: "1336", desc: "Gajah Mada bersumpah menyatukan Nusantara. Banyak kerajaan kecil menolak. Gunakan kekuatan militer atau diplomasi budaya?", opt1: "Ekspedisi Militer", opt2: "Diplomasi Perkawinan", m: [20, 5], l: [-30, 10], s: [-10, 25] },
    { title: "Jatuhnya Malaka", era: "1511", desc: "Portugis memblokade selat. Kirim bantuan ke Sultan Mahmud Syah atau perkuat pertahanan internal?", opt1: "Kirim Armada", opt2: "Bertahan di Dalam", m: [15, -10], l: [-20, 20], s: [10, 5] }
    // Tambahkan hingga 35 misi dengan pola yang sama
];

let player = { id: "", name: "", m: 50, l: 50, s: 50, cur: 0 };
let selectedIdx = null;

// FUNGSI UTAMA: Pindah Layar
function showScreen(id) {
    document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

// 1. Tombol Masuk/Registrasi
document.getElementById("btn-reg").onclick = () => {
    const name = document.getElementById("in-name").value.trim().toUpperCase();
    if (!name) return alert("Komandan, masukkan identitas!");

    player.name = name;
    player.id = name.replace(/\s+/g, '_') + "_" + Math.floor(Math.random()*9000);

    set(ref(db, "players/" + player.id), player).then(() => {
        showScreen("scr-wait");
        listenForStart();
    });
};

// 2. Listener: Menunggu Guru Klik "Start"
function listenForStart() {
    onValue(ref(db, "gameConfig/status"), (snap) => {
        if (snap.val() === "STARTED") {
            showScreen("scr-game");
            renderMission();
            updateUI();
        }
    });
}

// 3. Render Misi ke Layar
function renderMission() {
    if (player.cur >= missions.length) {
        alert("MISI SELESAI! Menunggu Rekapitulasi.");
        return showScreen("scr-wait");
    }

    const data = missions[player.cur];
    document.getElementById("ev-title").innerText = data.title;
    document.getElementById("ev-desc").innerHTML = `<small>TAHUN ${data.era}</small><br><br>${data.desc}`;
    
    const container = document.getElementById("opt-container");
    container.innerHTML = ""; // Reset opsi sebelumnya

    // Buat Opsi (RPG Style)
    [data.opt1, data.opt2].forEach((text, i) => {
        const div = document.createElement("div");
        div.className = "opt-card";
        div.innerText = text;
        div.onclick = () => {
            document.querySelectorAll(".opt-card").forEach(c => c.classList.remove("selected"));
            div.classList.add("selected");
            selectedIdx = i;
            document.getElementById("ref-box").classList.remove("hidden");
        };
        container.appendChild(div);
    });
}

// 4. Submit Jawaban & Update Statistik
document.getElementById("btn-submit-turn").onclick = () => {
    const reason = document.getElementById("ref-input").value.trim();
    if (reason.length < 10) return alert("Markas butuh alasan strategis!");

    const impact = missions[player.cur];
    player.m += impact.m[selectedIdx];
    player.l += impact.l[selectedIdx];
    player.s += impact.s[selectedIdx];
    player.cur++;

    update(ref(db, "players/" + player.id), player).then(() => {
        document.getElementById("ref-input").value = "";
        document.getElementById("ref-box").classList.add("hidden");
        renderMission();
        updateUI();
    });
};

// 5. Update Visual Angka (Moral, Logistik, Dukungan)
function updateUI() {
    document.getElementById("v-m").innerText = player.m;
    document.getElementById("v-l").innerText = player.l;
    document.getElementById("v-s").innerText = player.s;
    
    // Efek warna jika statistik kritis
    if(player.m < 30) document.getElementById("v-m").style.color = "red";
    else document.getElementById("v-m").style.color = "var(--indo-red)";
}
