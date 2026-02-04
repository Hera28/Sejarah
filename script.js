// ... (kode JS sebelumnya tetap)

// Registrasi murid
document.getElementById("btn-reg").onclick = () => {
    console.log("Tombol registrasi murid diklik!"); // Debug
    const name = document.getElementById("in-name").value.trim().toUpperCase();
    if (!name) return alert("Masukkan nama lengkap!");
    player.id = name.replace(/\s+/g,"_") + "_" + Math.floor(1000 + Math.random()*9000);
    player.name = name;
    set(ref(db, "players/" + player.id), player);
    showScreen("scr-wait");
};

// Admin guru
document.getElementById("link-admin").onclick = e => {
    e.preventDefault();
    console.log("Link admin guru diklik!"); // Debug
    const pw = prompt("Kode Otoritas Guru:");
    if (pw === "sejarah123") showScreen("scr-admin");
};

// ... (sisanya tetap)
