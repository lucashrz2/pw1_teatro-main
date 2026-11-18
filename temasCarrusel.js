document.addEventListener("DOMContentLoaded", () => {
    const btnTema = document.getElementById("btnTema");
    const temaGuardado = localStorage.getItem("temaClicket");

    // Aplicar tema guardado al cargar cualquier página
    if (temaGuardado === "claro") {
        document.body.classList.add("modo-claro");
        if (btnTema) btnTema.textContent = "☀️";
    }

    if (btnTema) {
        btnTema.addEventListener("click", () => {
            const esClaro = document.body.classList.toggle("modo-claro");
            localStorage.setItem("temaClicket", esClaro ? "claro" : "oscuro");
            btnTema.textContent = esClaro ? "☀️" : "🌙";
        });
    }
});