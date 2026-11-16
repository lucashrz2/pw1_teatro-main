document.addEventListener("DOMContentLoaded", () => {
    const btnGrilla = document.getElementById("btn-grilla");
    const btnLista = document.getElementById("btn-lista");
    const contenedorObras = document.querySelector(".grilla-obras");

    if (btnGrilla && btnLista && contenedorObras) {
        // Al hacer clic en "Lista"
        btnLista.addEventListener("click", () => {
            contenedorObras.classList.add("vista-lista");
            btnLista.classList.add("activo");
            btnGrilla.classList.remove("activo");
        });

        // Al hacer clic en "Grilla"
        btnGrilla.addEventListener("click", () => {
            contenedorObras.classList.remove("vista-lista");
            btnGrilla.classList.add("activo");
            btnLista.classList.remove("activo");
        });
    }
});