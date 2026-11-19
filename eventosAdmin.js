// =========================================================
// GESTIÓN DE EVENTOS DEL ADMINISTRADOR (miCuentaAdmin.html)
// =========================================================

const KEY_EVENTOS_ADMIN = "obrasAdmin";

function obtenerEventosAdmin() {
    return JSON.parse(localStorage.getItem(KEY_EVENTOS_ADMIN)) || [];
}

function guardarEventosAdmin(lista) {
    localStorage.setItem(KEY_EVENTOS_ADMIN, JSON.stringify(lista));
}

document.addEventListener("DOMContentLoaded", () => {
    const grillaAdmin = document.querySelector("#obras-publicadas .grilla-favoritos");
    const btnCrear = document.querySelector("#obras-publicadas .boton-crear");

    if (!grillaAdmin || !btnCrear) return;

    // 1. Inyectar el Modal de Crear / Editar Evento
    const modalHTML = `
        <div id="modal-evento" class="modal-evento-overlay">
            <div class="modal-evento-caja">
                <h3 id="titulo-modal-evento">Crear Nuevo Evento</h3>
                <form id="form-evento-admin">
                    <input type="hidden" id="evento-id">

                    <div class="grupo-formulario">
                        <label for="evento-titulo">Título de la obra</label>
                        <input type="text" id="evento-titulo" placeholder="Ej: Noche de Comedia" required>
                    </div>

                    <div class="grupo-formulario">
                        <label for="evento-categoria">Categoría</label>
                        <select id="evento-categoria" required>
                            <option value="Comedia">Comedia</option>
                            <option value="Drama">Drama</option>
                            <option value="Musical">Musical</option>
                            <option value="Infantil">Infantil</option>
                            <option value="Stand Up">Stand Up</option>
                        </select>
                    </div>

                    <div class="grupo-formulario">
                        <label for="evento-ubicacion">Zona y Teatro</label>
                        <input type="text" id="evento-ubicacion" placeholder="Ej: CABA • Teatro Ópera" required>
                    </div>

                    <div class="modal-fila-doble">
                        <div class="grupo-formulario">
                            <label for="evento-precio">Precio ($ ARS)</label>
                            <input type="number" id="evento-precio" placeholder="45000" min="1" required>
                        </div>
                        <div class="grupo-formulario">
                            <label for="evento-capacidad">Capacidad total</label>
                            <input type="number" id="evento-capacidad" placeholder="200" min="1" required>
                        </div>
                    </div>

                    <div class="grupo-formulario">
                        <label for="evento-imagen">Imagen de portada</label>
                        <select id="evento-imagen">
                            <option value="img/drama.jpg">Drama (Telón / Escenario)</option>
                            <option value="img/comedia.jpeg">Comedia</option>
                            <option value="img/musical.jpeg">Musical</option>
                            <option value="img/stand up.jpg">Stand Up</option>
                            <option value="img/infantil_2.jpg">Infantil</option>
                            <option value="img/recital.jpg">Recital</option>
                            <option value="img/monologo.jpg">Monólogo</option>
                        </select>
                    </div>

                    <div class="modal-acciones">
                        <button type="button" id="btn-cancelar-modal" class="boton-cancelar-modal">Cancelar</button>
                        <button type="submit" class="boton-guardar">Guardar Evento</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    const modal = document.getElementById("modal-evento");
    const formEvento = document.getElementById("form-evento-admin");
    const tituloModal = document.getElementById("titulo-modal-evento");

    function abrirModal(eventoEditar = null) {
        if (eventoEditar) {
            tituloModal.textContent = "Editar Evento";
            document.getElementById("evento-id").value = eventoEditar.id;
            document.getElementById("evento-titulo").value = eventoEditar.titulo;
            document.getElementById("evento-categoria").value = eventoEditar.categoria;
            document.getElementById("evento-ubicacion").value = eventoEditar.ubicacion;
            document.getElementById("evento-precio").value = eventoEditar.precioNumerico || "";
            document.getElementById("evento-capacidad").value = eventoEditar.capacidad;
            document.getElementById("evento-imagen").value = eventoEditar.imagen;
        } else {
            tituloModal.textContent = "Crear Nuevo Evento";
            formEvento.reset();
            document.getElementById("evento-id").value = "";
        }
        modal.style.display = "flex";
    }

    function cerrarModal() {
        modal.style.display = "none";
    }

    // 2. Renderizar SOLO los eventos creados por el admin logueado
    function renderizarEventosAdmin() {
        grillaAdmin.querySelectorAll(".tarjeta-dinamica-admin").forEach(el => el.remove());

        const sesion = JSON.parse(localStorage.getItem("sesion"));
        const eventos = obtenerEventosAdmin();
        const misEventos = sesion ? eventos.filter(ev => ev.creador === sesion.usuario) : [];

        misEventos.forEach(ev => {
            const articulo = document.createElement("article");
            articulo.className = "tarjeta-evento tarjeta-admin tarjeta-dinamica-admin";
            articulo.dataset.id = ev.id;

            articulo.innerHTML = `
                <span class="etiqueta-estado activo">Activo</span>
                <img src="${ev.imagen}" alt="${ev.titulo}">
                <h3>${ev.titulo}</h3>
                <p class="informacion-evento">${ev.ubicacion}</p>
                <p class="ventas-evento"><strong>0 / ${ev.capacidad}</strong> entradas vendidas • ${ev.precioTexto}</p>
                
                <div class="acciones-admin">
                    <button type="button" class="boton-editar">Editar</button>
                    <button type="button" class="boton-eliminar">Eliminar</button>
                </div>
            `;

            grillaAdmin.appendChild(articulo);
        });
    }

    // 3. Eventos del modal y botones
    btnCrear.addEventListener("click", (e) => {
        e.preventDefault();
        abrirModal();
    });

    document.getElementById("btn-cancelar-modal").addEventListener("click", cerrarModal);

    modal.addEventListener("click", (e) => {
        if (e.target === modal) cerrarModal();
    });

    formEvento.addEventListener("submit", (e) => {
        e.preventDefault();

        const sesion = JSON.parse(localStorage.getItem("sesion"));
        if (!sesion) return;

        const idExistente = document.getElementById("evento-id").value;
        const titulo = document.getElementById("evento-titulo").value.trim();
        const categoria = document.getElementById("evento-categoria").value;
        const ubicacion = document.getElementById("evento-ubicacion").value.trim();
        const precioNumerico = Number(document.getElementById("evento-precio").value);
        const capacidad = Number(document.getElementById("evento-capacidad").value);
        const imagen = document.getElementById("evento-imagen").value;
        const precioTexto = `Desde $ ${precioNumerico.toLocaleString("es-AR")} ARS`;

        let eventos = obtenerEventosAdmin();

        if (idExistente) {
            // EDITAR solo si pertenece a este admin
            const idx = eventos.findIndex(ev => ev.id === idExistente && ev.creador === sesion.usuario);
            if (idx !== -1) {
                eventos[idx] = {
                    ...eventos[idx],
                    titulo,
                    alt: titulo,
                    categoria,
                    ubicacion,
                    precioNumerico,
                    precioTexto,
                    capacidad,
                    imagen
                };
            }
        } else {
            // CREAR asociando al admin actual
            eventos.push({
                id: "admin-" + Date.now(),
                creador: sesion.usuario,
                titulo,
                alt: titulo,
                categoria,
                ubicacion,
                precioNumerico,
                precioTexto,
                capacidad,
                imagen,
                fecha: "Próximamente"
            });
        }

        guardarEventosAdmin(eventos);
        renderizarEventosAdmin();
        cerrarModal();
    });

    // Editar y Eliminar (verificando que pertenezca al admin logueado)
    grillaAdmin.addEventListener("click", (e) => {
        const tarjeta = e.target.closest(".tarjeta-dinamica-admin");
        if (!tarjeta) return;

        const sesion = JSON.parse(localStorage.getItem("sesion"));
        const id = tarjeta.dataset.id;
        const eventos = obtenerEventosAdmin();

        if (e.target.closest(".boton-eliminar")) {
            if (confirm("¿Seguro que querés eliminar este evento?")) {
                const filtrados = eventos.filter(ev => !(ev.id === id && ev.creador === sesion?.usuario));
                guardarEventosAdmin(filtrados);
                renderizarEventosAdmin();
            }
        } else if (e.target.closest(".boton-editar")) {
            const eventoAEditar = eventos.find(ev => ev.id === id && ev.creador === sesion?.usuario);
            if (eventoAEditar) abrirModal(eventoAEditar);
        }
    });

    renderizarEventosAdmin();
});