document.addEventListener("DOMContentLoaded", () => {
    const btnAbrirPago = document.getElementById("btn-finalizar-compra") || document.getElementById("btn-abrir-pago");
    const modalPago = document.getElementById("modal-pago");
    const btnCerrarModal = document.getElementById("btn-cerrar-modal");
    const btnDatosPrueba = document.getElementById("btn-datos-prueba");
    const btnAceptarExito = document.getElementById("btn-aceptar-exito");
    const formCheckout = document.getElementById("form-checkout");

    const pasoFormulario = document.getElementById("paso-formulario");
    const pasoCargando = document.getElementById("paso-cargando");
    const pasoExito = document.getElementById("paso-exito");

    const totalModal = document.getElementById("total-modal");
    const correoConfirmado = document.getElementById("correo-confirmado");

    if (btnAbrirPago && modalPago) {
        btnAbrirPago.addEventListener("click", () => {
            const carrito = JSON.parse(localStorage.getItem("miCarrito")) || [];

            if (carrito.length === 0) {
                if (typeof mostrarNotificacionCarrito === "function") {
                    mostrarNotificacionCarrito("Agregá al menos una entrada antes de comprar.");
                } else {
                    alert("Tu carrito está vacío. Agregá entradas antes de comprar.");
                }
                return;
            }

            let subtotal = 0;
            for (let i = 0; i < carrito.length; i++) {
                const rawPrecio = carrito[i].precioUnitario ?? carrito[i].precio ?? 0;
                const precioNumero = Number(String(rawPrecio).replace(/\D/g, "")) || 0;
                const cantidad = Number(carrito[i].cantidad) || 1;
                subtotal += precioNumero * cantidad;
            }

            const totalConServicio = subtotal + Math.round(subtotal * 0.10);
            if (totalModal) {
                totalModal.textContent = typeof formatearARS === "function"
                    ? formatearARS(totalConServicio)
                    : `$ ${totalConServicio.toLocaleString("es-AR")} ARS`;
            }

            pasoFormulario.style.display = "block";
            pasoCargando.style.display = "none";
            pasoExito.style.display = "none";
            modalPago.style.display = "flex";
        });
    }

    if (btnCerrarModal && modalPago) {
        btnCerrarModal.addEventListener("click", () => {
            modalPago.style.display = "none";
        });
    }

    if (btnAceptarExito && modalPago) {
        btnAceptarExito.addEventListener("click", () => {
            modalPago.style.display = "none";
            window.location.reload();
        });
    }

    if (btnDatosPrueba) {
        btnDatosPrueba.addEventListener("click", () => {
            document.getElementById("nombre").value = "Lucas Hruza";
            document.getElementById("email").value = "lucas@gmail.com";
            document.getElementById("tarjeta").value = "4509 1234 5678 9012";
            document.getElementById("vencimiento").value = "09/29";
            document.getElementById("cvv").value = "123";
        });
    }

    if (formCheckout) {
        formCheckout.addEventListener("submit", (e) => {
            e.preventDefault();

            const emailIngresado = document.getElementById("email").value.trim();

            pasoFormulario.style.display = "none";
            pasoCargando.style.display = "block";

            setTimeout(() => {
                pasoCargando.style.display = "none";
                pasoExito.style.display = "block";
                if (correoConfirmado) {
                    correoConfirmado.textContent = emailIngresado;
                }

                localStorage.removeItem("miCarrito");

                const contador = document.getElementById("contador-carrito");
                if (contador) {
                    contador.textContent = "0";
                }
            }, 2000);
        });
    }
});