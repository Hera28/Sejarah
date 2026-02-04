import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getDatabase, ref, set, update, onValue, remove } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAclyNf8Dy69UD0X9IwuNo4QH3BfAzmfZY",
    authDomain: "sejarah-game.firebaseapp.com",
    databaseURL: "https://sejarah-game-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "sejarah-game",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let player = { id: "", name: "", m:50, l:50, s:50, cur:0, history:[], stability:50 };
let missions = [];

const screens = document.querySelectorAll("main > section");
const showScreen = id => {
    screens.forEach(s => s.classList.add("hidden"));
    document.getElementById(id).classList.remove("hidden");
};

// 30 Alternate History Open-Ended Scenes (1800–2000)
const defaultMissions = [
    { t:1800, title:"Belanda memperkuat monopoli VOC", desc:"Apa yang akan kamu lakukan sebagai pemimpin lokal?" },
    { t:1811, title:"Invasi Inggris ke Jawa", desc:"Bagaimana sikapmu terhadap kekuasaan sementara Inggris?" },
    { t:1825, title:"Perang Diponegoro dimulai", desc:"Apakah kamu mendukung Pangeran Diponegoro atau mencari jalan damai?" },
    { t:1830, title:"Sistem Cultuurstelsel diterapkan", desc:"Strategi apa yang kamu ambil untuk melindungi rakyat?" },
    { t:1860, title:"Akhir cultuurstelsel tapi pajak tanah naik", desc:"Bagaimana kamu menjaga stabilitas ekonomi rakyat?" },
    { t:1901, title:"Politik Etis dimulai", desc:"Apakah kamu percaya janji Belanda atau tetap waspada?" },
    { t:1908, title:"Budi Utomo lahir", desc:"Langkah apa yang kamu ambil untuk mempercepat kesadaran nasional?" },
    { t:1928, title:"Sumpah Pemuda diucapkan", desc:"Bagaimana kamu memperkuat semangat persatuan?" },
    { t:1930-an, title:"Depresi ekonomi dunia melanda", desc:"Strategi bertahan ekonomi apa yang kamu pilih?" },
    { t:1942, title:"Jepang menduduki Indonesia", desc:"Apakah kamu bekerja sama atau melawan secara diam-diam?" },
    { t:1945, title:"Proklamasi Kemerdekaan", desc:"Apa prioritas pertama pemerintahan baru?" },
    { t:1947, title:"Agresi Militer Belanda I", desc:"Bagaimana diplomasi dan perlawananmu?" },
    { t:1949, title:"Pengakuan Kedaulatan", desc:"Apa tantangan terbesar setelah merdeka?" },
    { t:1955, title:"Konferensi Asia-Afrika", desc:"Posisi Indonesia di panggung dunia bagaimana?" },
    { t:1957, title:"Demokrasi Terpimpin dimulai", desc:"Apakah kamu mendukung konsep ini?" },
    { t:1963, title:"Konfrontasi dengan Malaysia", desc:"Apa pendekatan terbaik untuk klaim wilayah?" },
    { t:1965, title:"Gestapu & peralihan kekuasaan", desc:"Bagaimana kamu menjaga stabilitas nasional?" },
    { t:1966, title:"Orde Baru dimulai", desc:"Apa kebijakan ekonomi utama yang kamu usulkan?" },
    { t:1975, title:"Invasi Timor Timur", desc:"Apa pertimbangan strategis dan moralnya?" },
    { t:1980-an, title:"Boom minyak mereda", desc:"Diversifikasi ekonomi seperti apa?" },
    { t:1997, title:"Krisis moneter Asia", desc:"Bagaimana mengatasi inflasi & kerusuhan?" },
    { t:1998, title:"Reformasi & jatuhnya Soeharto", desc:"Apa sistem politik ideal pasca-Orde Baru?" },
    { t:1999, title:"Referendum Timor Timur", desc:"Bagaimana menangani isu separatisme?" },
    { t:2004, title:"Tsunami Aceh", desc:"Strategi rekonstruksi dan perdamaian Aceh?" },
    // Tambah 5–6 lagi sesuai kebutuhan (sampai 30)
    // Contoh:
    { t:1900, title:"Apa jika Belanda kalah dari Jepang lebih awal?", desc:"Bagaimana nasib Hindia Belanda?" },
    { t:1942, title:"Apa jika Jepang beri kemerdekaan 1943?", desc:"Apa dampaknya bagi perjuangan?" },
    { t:1965, title:"Apa jika PKI menang?", desc:"Indonesia komunis seperti apa?" },
    // dst...
];

const checkIntervention = () => {
    if (player.l <= 15) {
        return { name:"INTERVENSI DARURAT", desc:"Logistik kritis! Uni Soviet menawarkan bantuan.", opt:[{text:"Terima bantuan USSR (Logistik → 70, Dukungan ↓25)", fixL:70, s:-25}] };
    }
    return null;
};

const renderMission = () => {
    if (player.cur >= missions.length) {
        document.getElementById("scr-game").innerHTML = "<h2>MISI SELESAI</h2><p>Terima kasih atas kontribusi strategismu, Komandan.</p>";
        return;
    }

    const intervention = checkIntervention();
    const area = document.getElementById("intervention-area");
    const titleEl = document.getElementById("ev-title");
    const descEl = document.getElementById("ev-desc");
    const opts = document.getElementById("opt-container");

    opts.innerHTML = "";
    area.innerHTML = "";

    if (intervention) {
        area.innerHTML = `<div class="intervention">🚨 ${intervention.name}</div>`;
        titleEl.textContent = "TAWARAN KHUSUS";
        descEl.textContent = intervention.desc;
        intervention.opt.forEach(o => {
            const btn = document.createElement("button");
            btn.textContent = o.text;
            btn.onclick = () => {
                if (o.fixL) player.l = o.fixL;
                else player.l += (o.l||0);
                player.m += (o.m||0);
                player.s += (o.s||0);
                nextStep();
            };
            opts.appendChild(btn);
        });
    } else {
        const misi = missions[player.cur];
        titleEl.textContent = `${misi.t} — ${misi.title}`;
        descEl.textContent = misi.desc + "\n\nTulis pemikiran & strategi alternatifmu:";
        document.getElementById("ref-box").classList.remove("hidden");
    }

    updateStats();
};

const updateStats = () => {
    document.getElementById("v-m").textContent = player.m;
    document.getElementById("v-l").textContent = player.l;
    document.getElementById("v-s").textContent = player.s;
    player.stability = Math.round((player.m + player.l + player.s) / 3);
};

const nextStep = () => {
    document.getElementById("ref-box").classList.add("hidden");
    player.cur++;
    update(ref(db, 'players/' + player.id), player);
    renderMission();
};

document.getElementById("btn-submit-turn").onclick = () => {
    const reason = document.getElementById("ref-input").value.trim();
    if (reason.length < 10) {
        alert("Jelaskan lebih detail strategi & alasanmu!");
        return;
    }
    player.history.push({ step: player.cur + 1, reason });
    document.getElementById("ref-input").value = "";
    nextStep();
};

// Registrasi
document.getElementById("btn-reg").onclick = () => {
    const name = document.getElementById("in-name").value.trim().toUpperCase();
    if (!name) return alert("Masukkan nama lengkap!");
    player.id = name.replace(/\s+/g,"_") + "_" + Math.floor(1000 + Math.random()*9000);
    player.name = name;
    set(ref(db, "players/" + player.id), player);
    showScreen("scr-wait");
};

// Admin
document.getElementById("link-admin").onclick = e => {
    e.preventDefault();
    const pw = prompt("Kode Otoritas Guru:");
    if (pw === "sejarah123") showScreen("scr-admin");
};

document.getElementById("btn-start").onclick = () => {
    set(ref(db, "missions"), defaultMissions);
    set(ref(db, "gameStatus"), "START_" + Date.now());
    alert("30 misi telah diaktifkan!");
};

document.getElementById("btn-reset").onclick = () => {
    if (confirm("Yakin reset SEMUA data?")) {
        set(ref(db, "players"), null);
        set(ref(db, "missions"), null);
        set(ref(db, "gameStatus"), "WAIT");
    }
};

// Real-time listeners
onValue(ref(db, "missions"), snap => {
    missions = snap.val() || defaultMissions;
});

onValue(ref(db, "gameStatus"), snap => {
    if (snap.val()?.startsWith("START") && player.id) {
        showScreen("scr-game");
        renderMission();
    }
});

onValue(ref(db, "players"), snap => {
    const players = snap.val() || {};
    const sorted = Object.values(players).sort((a,b) => b.stability - a.stability);

    // Leaderboard
    document.getElementById("leaderboard-list").innerHTML = sorted.slice(0,10).map((p,i) => `
        <div class="rank-item ${i<3?'top':''}">
            <span>${i+1}. ${p.name.substring(0,18)}</span>
            <span>${p.stability}%</span>
        </div>
    `).join("");

    // War Room grid (40 slot)
    const grid = document.getElementById("army-grid");
    grid.innerHTML = "";
    const ids = Object.keys(players);
    for (let i = 0; i < 40; i++) {
        const dot = document.createElement("div");
        dot.className = "dot" + (ids[i] ? " active" : "") + (ids[i] === player.id ? " me" : "");
        dot.textContent = ids[i] ? players[ids[i]].name.substring(0,2) : (i+1);
        grid.appendChild(dot);
    }

    // Admin monitor
    document.getElementById("monitor-body").innerHTML = sorted.map(p => `
        <tr>
            <td>${p.name}</td>
            <td>${p.cur} / ${missions.length}</td>
            <td>${p.stability}%</td>
            <td>${p.history[p.history.length-1]?.reason.substring(0,40)||'-'}...</td>
        </tr>
    `).join("");
});