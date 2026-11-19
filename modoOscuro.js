document.addEventListener("DOMContentLoaded", () => {
    const btnTema = document.getElementById("btnTema");
    const temaGuardado = localStorage.getItem("tema");

    // Rutas de las imágenes
    const imgSol = '<img src="img/sol.png" alt="Modo claro" width="24" height="24">';
    const imgLuna = '<img src="img/luna4.png" alt="Modo oscuro" width="24" height="24">';

    // 1. Verificar preferencia previa en localStorage
    if (temaGuardado === "claro") {
        document.body.classList.add("modo-claro");
        if (btnTema) btnTema.innerHTML = imgSol;
    } else {
        if (btnTema) btnTema.innerHTML = imgLuna;
    }

    // 2. Alternar estado al hacer clic
    if (btnTema) {
    btnTema.addEventListener("click", (e) => {
        e.preventDefault();
        document.body.classList.toggle("modo-claro");

        // Definir esClaro correctamente después del toggle
        const esClaro = document.body.classList.contains("modo-claro");

        // Actualizar imagen y guardar persistencia
        btnTema.innerHTML = esClaro ? imgSol : imgLuna;
        localStorage.setItem("tema", esClaro ? "claro" : "oscuro");
        });
    }
});