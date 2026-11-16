function obtenerCarrito() {
    return JSON.parse(localStorage.getItem("miCarrito")) || [];
}

function guardarCarrito(carrito) {
    localStorage.setItem("miCarrito", JSON.stringify(carrito));
    actualizarContadorCarrito();
}

function extraerPrecioNumerico(precioTexto) {
    const soloNumeros = String(precioTexto).replace(/\D/g, "");
    return Number(soloNumeros) || 0;
}

function formatearARS(monto) {
    return `$ ${monto.toLocaleString("es-AR")} ARS`;
}

// Actualiza el badge numérico del carrito en la barra de navegación
function actualizarContadorCarrito() {
    const carrito = obtenerCarrito();
    const totalUnidades = carrito.reduce((acum, item) => acum + item.cantidad, 0);

    document.querySelectorAll("#contador-carrito").forEach(badge => {
        badge.textContent = totalUnidades;
    });
}

// Agrega un ítem o autoincrementa su cantidad si ya existe
function agregarAlCarrito(producto) {
    const carrito = obtenerCarrito();
    const existente = carrito.find(item => item.id === producto.id);

    if (existente) {
        existente.cantidad += 1;
    } else {
        carrito.push({
            id: producto.id,
            titulo: producto.titulo,
            ubicacion: producto.ubicacion,
            precioUnitario: extraerPrecioNumerico(producto.precio),
            imagen: producto.imagen,
            cantidad: 1
        });
    }

    guardarCarrito(carrito);

    const cantidadActual = existente ? existente.cantidad : 1;
    mostrarNotificacionCarrito(`¡"${producto.titulo}" se agregó al carrito! (${cantidadActual})`);
}

function mostrarNotificacionCarrito(mensaje) {
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

// Renderizado e interacción dentro de carrito.html
document.addEventListener("DOMContentLoaded", () => {
    actualizarContadorCarrito();

    const listaCarrito = document.getElementById("lista-carrito");
    if (!listaCarrito) return;

    function renderizarCarrito() {
        const carrito = obtenerCarrito();
        const totalEntradasEl = document.getElementById("total-entradas");
        const subtotalEl = document.getElementById("subtotal-carrito");
        const cargoEl = document.getElementById("cargo-servicio");
        const totalEl = document.getElementById("total-carrito");

        if (carrito.length === 0) {
            listaCarrito.innerHTML = `
                <div class="carrito-vacio">
                    <p>Tu carrito está vacío por el momento.</p>
                    <a href="index.html" class="btn-volver-cartelera">Explorar cartelera</a>
                </div>
            `;
            totalEntradasEl.textContent = "0";
            subtotalEl.textContent = "$ 0 ARS";
            cargoEl.textContent = "$ 0 ARS";
            totalEl.textContent = "$ 0 ARS";
            return;
        }

        let totalUnidades = 0;
        let subtotalGeneral = 0;

        listaCarrito.innerHTML = carrito.map(item => {
            const subtotalItem = item.precioUnitario * item.cantidad;
            totalUnidades += item.cantidad;
            subtotalGeneral += subtotalItem;

            return `
                <article class="item-carrito" data-id="${item.id}">
                    <div class="item-info-izq">
                        <img src="${item.imagen}" alt="${item.titulo}">
                        <div class="item-detalles">
                            <h3>${item.titulo}</h3>
                            <span class="item-ubicacion">${item.ubicacion}</span>
                            <span class="item-precio-unit">${formatearARS(item.precioUnitario)} c/u</span>
                        </div>
                    </div>

                    <div class="item-controles-der">
                        <div class="controles-cantidad">
                            <button type="button" class="btn-cant btn-restar" title="Restar">−</button>
                            <span class="cantidad-valor">${item.cantidad}</span>
                            <button type="button" class="btn-cant btn-sumar" title="Sumar">+</button>
                        </div>
                        <span class="item-subtotal">${formatearARS(subtotalItem)}</span>
                        <button type="button" class="btn-eliminar">Eliminar</button>
                    </div>
                </article>
            `;
        }).join("");

        const cargoServicio = Math.round(subtotalGeneral * 0.10);
        const totalFinal = subtotalGeneral + cargoServicio;

        totalEntradasEl.textContent = totalUnidades;
        subtotalEl.textContent = formatearARS(subtotalGeneral);
        cargoEl.textContent = formatearARS(cargoServicio);
        totalEl.textContent = formatearARS(totalFinal);
    }

    // Botones +, − y Eliminar dentro de carrito.html
    listaCarrito.addEventListener("click", (e) => {
        const itemEl = e.target.closest(".item-carrito");
        if (!itemEl) return;

        const id = itemEl.dataset.id;
        let carrito = obtenerCarrito();
        const index = carrito.findIndex(item => item.id === id);
        if (index === -1) return;

        if (e.target.closest(".btn-sumar")) {
            carrito[index].cantidad += 1;
            guardarCarrito(carrito);
            renderizarCarrito();
        } else if (e.target.closest(".btn-restar")) {
            if (carrito[index].cantidad > 1) {
                carrito[index].cantidad -= 1;
            } else {
                carrito.splice(index, 1);
            }
            guardarCarrito(carrito);
            renderizarCarrito();
        } else if (e.target.closest(".btn-eliminar")) {
            carrito.splice(index, 1);
            guardarCarrito(carrito);
            renderizarCarrito();
            mostrarNotificacionCarrito("Entrada eliminada del carrito.");
        }
    });

    // Vaciar carrito
    const btnVaciar = document.getElementById("btn-vaciar-carrito");
    if (btnVaciar) {
        btnVaciar.addEventListener("click", () => {
            if (obtenerCarrito().length === 0) return;
            guardarCarrito([]);
            renderizarCarrito();
            mostrarNotificacionCarrito("Se vació el carrito.");
        });
    }

    // Finalizar compra
    const btnFinalizar = document.getElementById("btn-finalizar-compra");
    if (btnFinalizar) {
        btnFinalizar.addEventListener("click", () => {
            if (obtenerCarrito().length === 0) {
                mostrarNotificacionCarrito("Agregá al menos una entrada antes de comprar.");
                return;
            }
            guardarCarrito([]);
            renderizarCarrito();
            mostrarNotificacionCarrito("¡Compra realizada con éxito! Revisá tus entradas.");
        });
    }

    renderizarCarrito();
});