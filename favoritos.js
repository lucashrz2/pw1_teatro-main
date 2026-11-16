document.addEventListener("DOMContentLoaded", () => {
    const grillaObras = document.getElementById("grilla-obras");
    const inputBuscar = document.getElementById("buscar-obra");
    const selectCategoria = document.getElementById("seleccionar-categoria");
    const selectZona = document.getElementById("seleccionar-zona");

    let todasLasObras = [];

    // Normaliza texto (quita tildes y pasa a minúsculas)
    function normalizarTexto(texto) {
        return String(texto || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();
    }

    // Genera la ruta hacia infoTarjetas/tarjeta-X.html según el id ("obra-1" -> "tarjeta-1.html")
    function obtenerUrlDetalle(idObra) {
        const numero = String(idObra).replace("obra-", "");
        return `infoTarjetas/tarjeta-${numero}.html`;
    }

    // ==========================================
    // 1. RENDERIZADO DEL CATÁLOGO PRINCIPAL
    // ==========================================
    function renderizarObras(lista) {
        if (!grillaObras) return;

        if (lista.length === 0) {
            grillaObras.innerHTML = `
                <div class="sin-resultados">
                    <p>No encontramos obras que coincidan con tu búsqueda.</p>
                    <button type="button" class="btn-limpiar-filtros">Limpiar filtros</button>
                </div>
            `;
            return;
        }

        grillaObras.innerHTML = lista.map(obra => {
            const urlDetalle = obtenerUrlDetalle(obra.id);

            return `
                <article class="tarjeta"
                    data-id="${obra.id}" 
                    data-titulo="${obra.titulo}" 
                    data-ubicacion="${obra.ubicacion}" 
                    data-precio="${obra.precioTexto}" 
                    data-imagen="${obra.imagen}"
                    data-url="${urlDetalle}">
                    <div class="contenedor-imagen-tarjeta">
                        <img src="${obra.imagen}" alt="${obra.alt}">
                        <span class="etiqueta-categoria">${obra.categoria}</span>
                    </div>
                    <div class="cuerpo-tarjeta">
                        <span class="ubicacion">${obra.ubicacion}</span>
                        <h3>${obra.titulo}</h3>
                        <p class="precio">${obra.precioTexto}</p>
                        <div class="acciones-tarjeta">
                            <a href="${urlDetalle}" class="boton-tarjeta">Agregar al Carrito</a>
                            <button class="boton-favorito" type="button">
                                <img src="img/corazon.png" alt="Favorito" class="imagen-icono">
                            </button>
                        </div>
                    </div>
                </article>
            `;
        }).join("");
    }

    // ==========================================
    // 2. FILTRADO POR TEXTO, CATEGORÍA Y ZONA
    // ==========================================
    function filtrarObras() {
        const texto = inputBuscar ? normalizarTexto(inputBuscar.value) : "";
        const categoria = selectCategoria ? normalizarTexto(selectCategoria.value) : "";
        const zona = selectZona ? normalizarTexto(selectZona.value) : "";

        const filtradas = todasLasObras.filter(obra => {
            const coincideTexto =
                normalizarTexto(obra.titulo).includes(texto) ||
                normalizarTexto(obra.categoria).includes(texto) ||
                normalizarTexto(obra.ubicacion).includes(texto);

            const coincideCategoria =
                categoria === "" ||
                categoria === "destacadas" ||
                normalizarTexto(obra.categoria) === categoria;

            const coincideZona =
                zona === "" ||
                normalizarTexto(obra.ubicacion).includes(zona);

            return coincideTexto && coincideCategoria && coincideZona;
        });

        renderizarObras(filtradas);
    }

    // ==========================================
    // 3. CARRUSEL DE PRÓXIMAS FUNCIONES
    // ==========================================
    function inicializarCarruselFunciones(obras) {
        const track = document.getElementById("carrusel-funciones");
        const indicadoresBox = document.getElementById("indicadores-carrusel");
        const btnPrev = document.getElementById("btn-prev-funciones");
        const btnNext = document.getElementById("btn-next-funciones");

        if (!track) return;

        track.innerHTML = obras.map((obra, index) => {
            const urlDetalle = obtenerUrlDetalle(obra.id);
            const tieneAgotadas = Array.isArray(obra.entradas) && obra.entradas.some(e => e.agotado);
            const textoBadge = tieneAgotadas ? "Últimas Entradas" : (index % 3 === 0 ? "Próximo Estreno" : "Disponible");
            const claseBadge = tieneAgotadas ? "badge-ultimas" : "badge-estreno";
            const fechaCorta = obra.fecha ? obra.fecha.replace(" de 2026", "") : "Próximamente";

            return `
                <a href="${urlDetalle}" class="tarjeta-proxima">
                    <div class="flyer-proxima-box">
                        <img src="${obra.imagen}" alt="${obra.alt}">
                        <span class="badge-estado-funcion ${claseBadge}">${textoBadge}</span>
                    </div>
                    <div class="info-proxima">
                        <h3>${obra.titulo}</h3>
                        <p class="fecha-proxima">📅 ${fechaCorta}</p>
                    </div>
                </a>
            `;
        }).join("");

        function actualizarIndicadores() {
            if (!indicadoresBox) return;
            const anchoVisible = track.clientWidth;
            const totalPaginas = Math.max(1, Math.ceil(track.scrollWidth / anchoVisible));
            const paginaActual = Math.min(
                totalPaginas - 1,
                Math.round(track.scrollLeft / anchoVisible)
            );

            indicadoresBox.innerHTML = Array.from({ length: totalPaginas }, (_, i) => `
                <button type="button" 
                        class="indicador-dot ${i === paginaActual ? "activo" : ""}" 
                        data-pagina="${i}" 
                        aria-label="Ir al grupo ${i + 1}">
                </button>
            `).join("");
        }

        if (btnPrev) {
            btnPrev.addEventListener("click", () => {
                track.scrollBy({ left: -track.clientWidth * 0.85, behavior: "smooth" });
            });
        }

        if (btnNext) {
            btnNext.addEventListener("click", () => {
                track.scrollBy({ left: track.clientWidth * 0.85, behavior: "smooth" });
            });
        }

        if (indicadoresBox) {
            indicadoresBox.addEventListener("click", (e) => {
                const dot = e.target.closest(".indicador-dot");
                if (!dot) return;
                const pagina = Number(dot.dataset.pagina);
                track.scrollTo({ left: pagina * track.clientWidth, behavior: "smooth" });
            });
        }

        track.addEventListener("scroll", actualizarIndicadores);
        window.addEventListener("resize", actualizarIndicadores);
        actualizarIndicadores();
    }

    // ==========================================
    // 4. CARGA DESDE JSON Y EVENTOS EN INDEX.HTML
    // ==========================================
    if (grillaObras) {
        fetch("datos/obras.json")
            .then(res => res.json())
            .then(obras => {
                todasLasObras = obras;
                renderizarObras(todasLasObras);
                inicializarCarruselFunciones(todasLasObras);
            })
            .catch(err => console.error("Error al cargar datos/obras.json:", err));

        if (inputBuscar) inputBuscar.addEventListener("input", filtrarObras);
        if (selectCategoria) selectCategoria.addEventListener("change", filtrarObras);
        if (selectZona) selectZona.addEventListener("change", filtrarObras);

        grillaObras.addEventListener("click", (e) => {
            // A. Limpiar filtros cuando no hay resultados
            if (e.target.closest(".btn-limpiar-filtros")) {
                if (inputBuscar) inputBuscar.value = "";
                if (selectCategoria) selectCategoria.value = "";
                if (selectZona) selectZona.value = "";
                renderizarObras(todasLasObras);
                return;
            }

            // B. Botón "Agregar al Carrito"
            const botonCarrito = e.target.closest(".boton-tarjeta");
            if (botonCarrito) {
                e.preventDefault();
                const tarjeta = botonCarrito.closest(".tarjeta");
                if (!tarjeta) return;

                if (typeof agregarAlCarrito === "function") {
                    agregarAlCarrito({
                        id: tarjeta.dataset.id,
                        titulo: tarjeta.dataset.titulo,
                        ubicacion: tarjeta.dataset.ubicacion,
                        precio: tarjeta.dataset.precio,
                        imagen: tarjeta.dataset.imagen
                    });
                }
                return;
            }

            // C. Botón de Favoritos (corazón)
            const botonFav = e.target.closest(".boton-favorito");
            if (botonFav) {
                const tarjeta = botonFav.closest(".tarjeta");
                if (!tarjeta) return;

                const item = {
                    id: tarjeta.dataset.id,
                    titulo: tarjeta.dataset.titulo,
                    ubicacion: tarjeta.dataset.ubicacion,
                    precio: tarjeta.dataset.precio,
                    imagen: tarjeta.dataset.imagen
                };

                let favoritos = JSON.parse(localStorage.getItem("misFavoritos")) || [];
                const existe = favoritos.some(fav => fav.id === item.id);

                if (!existe) {
                    favoritos.push(item);
                    localStorage.setItem("misFavoritos", JSON.stringify(favoritos));
                    mostrarNotificacion(`¡"${item.titulo}" se guardó en tus favoritos!`);
                } else {
                    mostrarNotificacion(`"${item.titulo}" ya está en tus favoritos.`);
                }
                return;
            }

            // D. Clic en la tarjeta -> navegar a infoTarjetas/tarjeta-X.html
            const tarjeta = e.target.closest(".tarjeta");
            if (tarjeta) {
                window.location.href = tarjeta.dataset.url;
            }
        });
    }

    // ==========================================
    // 5. NOTIFICACIÓN TOAST
    // ==========================================
    function mostrarNotificacion(mensaje) {
        let toast = document.getElementById("notificacion-toast");
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "notificacion-toast";
            toast.className = "notificacion-toast";
            document.body.appendChild(toast);
        }
        toast.textContent = mensaje;
        toast.classList.add("toast-visible");
        setTimeout(() => toast.classList.remove("toast-visible"), 3000);
    }

    // ==========================================
    // 6. PANEL DE FAVORITOS EN CUENTA-USUARIO.HTML
    // ==========================================
    const contenedorFavoritos = document.getElementById("contenedor-favoritos");
    if (contenedorFavoritos) {
        let favoritos = JSON.parse(localStorage.getItem("misFavoritos")) || [];

        if (favoritos.length === 0) {
            contenedorFavoritos.innerHTML = `
                <div class="mensaje-vacio">
                    <p>No tenés obras guardadas en tus favoritos aún.</p>
                    <a href="index.html" class="boton-explorar">Explorar cartelera</a>
                </div>
            `;
            return;
        }

        contenedorFavoritos.innerHTML = favoritos.map(item => `
            <article class="tarjeta-evento" data-id="${item.id}">
                <img src="${item.imagen}" alt="${item.titulo}">
                <h3>${item.titulo}</h3>
                <p class="detalles-fav">${item.ubicacion} <br><strong>${item.precio}</strong></p>
                <div class="acciones-fav-cuenta">
                    <a href="${obtenerUrlDetalle(item.id)}" class="boton-comprar">Comprar Entrada</a>
                    <button type="button" class="boton-quitar" onclick="quitarFavorito('${item.id}')">Quitar de favoritos</button>
                </div>
            </article>
        `).join("");
    }
});

// Función global para quitar un favorito desde cuenta-usuario.html
function quitarFavorito(id) {
    let favoritos = JSON.parse(localStorage.getItem("misFavoritos")) || [];
    favoritos = favoritos.filter(item => item.id !== id);
    localStorage.setItem("misFavoritos", JSON.stringify(favoritos));
    location.reload();
}