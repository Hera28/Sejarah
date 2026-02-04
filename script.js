import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, update, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// --- 1. FIREBASE CONFIGURATION ---
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

// --- 2. 35 SCENARIOS (THE WAR ROOM MISSIONS) ---
const missions = [
    { era: "1293", title: "Runtuhnya Singasari", desc: "Jayakatwang menyerang. Raden Wijaya menawarkan diri mengabdi pada Mongol untuk membalas dendam. Apakah Anda menerima aliansi asing demi tahta?", opt1: "Terima aliansi Mongol (Risiko kedaulatan)", opt2: "Gerilya mandiri (Risiko kekalahan total)", m: [10, -20], l: [30, -10], s: [20, -5] },
    { era: "1511", title: "Jatuhnya Malaka", desc: "Portal perdagangan utama jatuh ke Portugis. Sebagai Sultan, apakah Anda menyerang balik langsung atau memblokade jalur suplai?", opt1: "Serangan armada laut besar", opt2: "Diplomasi & Blokade ekonomi", m: [20, 5], l: [-30, 10], s: [-10, 25] },
    { era: "1628", title: "Batavia: Jan Pieterszoon Coen", desc: "Sultan Agung menyerang Batavia. Logistik menipis karena lumbung padi dibakar Belanda. Teruskan pengepungan atau mundur?", opt1: "Mundur & perkuat pertahanan dalam", opt2: "Serangan bunuh diri demi kehormatan", m: [-10, 30], l: [15, -40], s: [5, -10] },
    { era: "1825", title: "Perang Diponegoro", desc: "Belanda memasang patok jalan di tanah leluhur. Rakyat marah. Mulai perang terbuka sekarang atau kumpulkan kekuatan di Gua Selarong?", opt1: "Perang Terbuka (Frontal)", opt2: "Gerilya Selarong (Bertahap)", m: [25, 10], l: [-20, 15], s: [-5, 5] },
    { era: "1830", title: "Cultuurstelsel", desc: "Van den Bosch memaksa rakyat menanam kopi. Sebagai Bupati, apakah Anda menekan rakyat demi posisi atau memalsukan laporan hasil?", opt1: "Tekan rakyat (Loyal pada Belanda)", opt2: "Palsukan laporan (Resistensi halus)", m: [-30, 20], l: [40, -10], s: [10, -5] },
    { era: "1908", title: "Kebangkitan Nasional", desc: "Budi Utomo berdiri. Apakah gerakan harus tetap fokus pada pendidikan atau mulai berpolitik praktis melawan penjajah?", opt1: "Fokus Pendidikan (Jangka Panjang)", opt2: "Politik Radikal (Jangka Pendek)", m: [15, 20], l: [5, -5], s: [10, -10] },
    { era: "1942", title: "Kedatangan Jepang", desc: "Jepang mengaku 'Saudara Tua'. Apakah kita membantu mereka mengusir Belanda atau tetap netral waspada?", opt1: "Bantu Jepang (Propaganda 3A)", opt2: "Gerakan Bawah Tanah (Netral)", m: [10, 5], l: [20, -10], s: [-20, 10] },
    { era: "1945", title: "Rengasdengklok", desc: "Jepang menyerah pada Sekutu. Pemuda mendesak Proklamasi, Golongan Tua ingin rapat PPKI. Ikuti pemuda atau tunggu?", opt1: "Proklamasi Segera (Risiko Perang)", opt2: "Rapat PPKI (Jalur Aman)", m: [40, -10], l: [-10, 10], s: [-20, 30] },
    { era: "1945", title: "Pertempuran Surabaya", desc: "Ultimatum Mallaby: Serahkan senjata atau dibom. Mallaby tewas. Apakah arek-arek Surabaya harus menyerah atau lawan?", opt1: "Lawan sampai titik darah penghabisan", opt2: "Negosiasi evakuasi warga", m: [50, -15], l: [-30, 10], s: [-10, 40] },
    { era: "1947", title: "Agresi Militer I", desc: "Belanda melanggar Linggarjati. Ibukota terancam. Pindahkan pusat komando ke pedalaman atau tetap di kota bertahan?", opt1: "Pindah ke Pedalaman (Gerilya)", opt2: "Pertahankan Kota (Frontal)", m: [15, 10], l: [5, -20], s: [25, -5] },
    // ... Skenario 11-35 akan mengikuti pola yang sama secara kronologis (Reformasi, G30S, KAA, Irian Barat, hingga Krisis 98)
];

// Menambahkan placeholder sisa misi hingga 35 untuk struktur data
for(let i=11; i<=35; i++) {
    missions.push({ era: "Tahun "+(1950+i), title: "Misi Strategis "+i, desc: "Skenario konflik kepentingan nasional dalam pembangunan dan kedaulatan. Apa langkah komando Anda?", opt1: "Opsi Taktis A (Fokus Moral)", opt2: "Opsi Taktis B (Fokus Logistik)", m: [10, -10], l: [-5, 15], s: [5, 5] });
}

// --- 3. CORE LOGIC ENGINE ---
let player = { id: "", name: "", m: 50, l: 50, s: 50, cur: 0 };
let selectedOpt = null;

function showScreen(id) {
    document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

// Handler: Registrasi
document.getElementById("btn-reg").addEventListener("click", () => {
    const n = document.getElementById("in-name").value.trim().toUpperCase();
    if(!n) return alert("Identitas Komandan Wajib Diisi!");
    
    player.id = n.replace(/\s+/g, '_') + "_" + Math.floor(1000 + Math.random()*9000);
    player.name = n;
    
    set(ref(db, "players/" + player.id), player).then(() => {
        showScreen("scr-wait");
        listenToStart();
    });
});

// Handler: Load Mission
function renderMission() {
    const data = missions[player.cur];
    document.getElementById("ev-title").innerText = `MISI ${player.cur + 1}: ${data.title}`;
    document.getElementById("ev-desc").innerHTML = `<small>[ERA ${data.era}]</small><br>${data.desc}`;
    
    const container = document.getElementById("opt-container");
    container.innerHTML = "";
    
    [data.opt1, data.opt2].forEach((txt, i) => {
        const btn = document.createElement("button");
        btn.className = "opt-card";
        btn.innerText = txt;
        btn.onclick = () => {
            document.querySelectorAll(".opt-card").forEach(b => b.classList.remove("selected"));
            btn.classList.add("selected");
            selectedOpt = i;
            document.getElementById("ref-box").classList.remove("hidden");
        };
        container.appendChild(btn);
    });
}

// Handler: Submit Jawaban
document.getElementById("btn-submit-turn").addEventListener("click", () => {
    const reason = document.getElementById("ref-input").value.trim();
    if(reason.length < 15) return alert("Analisis Strategis terlalu singkat!");

    const impact = missions[player.cur];
    player.m += impact.m[selectedOpt];
    player.l += impact.l[selectedOpt];
    player.s += impact.s[selectedOpt];
    player.cur++;

    update(ref(db, "players/" + player.id), {
        m: player.m, l: player.l, s: player.s, 
        cur: player.cur, lastMsg: reason
    }).then(() => {
        if(player.cur >= 35) {
            alert("Operasi Selesai. Menunggu Evaluasi Akhir Markas Besar.");
            showScreen("scr-wait");
        } else {
            document.getElementById("ref-input").value = "";
            document.getElementById("ref-box").classList.add("hidden");
            renderMission();
            updateStats();
        }
    });
});

function updateStats() {
    document.getElementById("v-m").innerText = player.m;
    document.getElementById("v-l").innerText = player.l;
    document.getElementById("v-s").innerText = player.s;
}

function listenToStart() {
    onValue(ref(db, "gameConfig/status"), (snap) => {
        if(snap.val() === "STARTED") {
            showScreen("scr-game");
            renderMission();
            updateStats();
        }
    });
}
