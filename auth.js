// =========================================================
// 1. SINCRONIZAR FAVORITOS DE LA CUENTA ACTIVA
// =========================================================
function sincronizarFavoritosDeCuenta() {
    const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));
    if (!usuarioActivo) return;

    const usuariosGuardados = JSON.parse(localStorage.getItem("usuariosClicket")) || [];
    const favsActuales = JSON.parse(localStorage.getItem("misFavoritos")) || [];

    usuarioActivo.favoritos = favsActuales;
    localStorage.setItem("usuarioActivo", JSON.stringify(usuarioActivo));

    for (let i = 0; i < usuariosGuardados.length; i++) {
        if (
            usuariosGuardados[i].usuario === usuarioActivo.usuario &&
            usuariosGuardados[i].rol === usuarioActivo.rol
        ) {
            usuariosGuardados[i].favoritos = favsActuales;
            break;
        }
    }
    localStorage.setItem("usuariosClicket", JSON.stringify(usuariosGuardados));
}

// Respalda los favoritos en la cuenta cada vez que se interactúa en la página
document.addEventListener("click", () => {
    setTimeout(sincronizarFavoritosDeCuenta, 50);
});

document.addEventListener("DOMContentLoaded", () => {
    const usuariosGuardados = JSON.parse(localStorage.getItem("usuariosClicket")) || [];
    const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));

    // =========================================================================
    // A. FORMULARIOS DE REGISTRO Y LOGIN (registroCuentas.html y login.html)
    // =========================================================================
    const formAuth = document.querySelector(".formulario-autenticacion");

    if (formAuth) {
        formAuth.addEventListener("submit", (e) => {
            e.preventDefault();

            const rolSeleccionado = document.querySelector('input[name="rol"]:checked').value;
            const usuarioIngresado = document.getElementById("campo-usuario").value.trim();
            const contrasenaIngresada = document.getElementById("campo-contrasena").value.trim();
            const inputNombre = document.getElementById("campo-nombre");

            if (inputNombre) {
                // --- REGISTRO DE CUENTA ---
                const nombre = inputNombre.value.trim();
                const apellido = document.getElementById("campo-apellido").value.trim();

                let yaExiste = false;
                for (let i = 0; i < usuariosGuardados.length; i++) {
                    if (
                        usuariosGuardados[i].usuario.toLowerCase() === usuarioIngresado.toLowerCase() &&
                        usuariosGuardados[i].rol === rolSeleccionado
                    ) {
                        yaExiste = true;
                        break;
                    }
                }

                if (yaExiste) {
                    alert("Ese usuario o email ya está registrado para este rol. Iniciá sesión.");
                    return;
                }

                const emailInicial = usuarioIngresado.includes("@") ? usuarioIngresado : "";

                const nuevaCuenta = {
                    usuario: usuarioIngresado,
                    nombre: nombre,
                    apellido: apellido,
                    email: emailInicial,
                    telefono: "",
                    contrasena: contrasenaIngresada,
                    rol: rolSeleccionado,
                    favoritos: []
                };

                usuariosGuardados.push(nuevaCuenta);
                localStorage.setItem("usuariosClicket", JSON.stringify(usuariosGuardados));
                localStorage.setItem("usuarioActivo", JSON.stringify(nuevaCuenta));
                localStorage.setItem("misFavoritos", JSON.stringify([]));

                window.location.href = rolSeleccionado === "admin" ? "miCuentaAdmin.html" : "miCuentaUser.html";
            } else {
                // --- INICIO DE SESIÓN ---
                let cuentaEncontrada = null;

                for (let i = 0; i < usuariosGuardados.length; i++) {
                    const u = usuariosGuardados[i];
                    const coincideIdentificador =
                        u.usuario.toLowerCase() === usuarioIngresado.toLowerCase() ||
                        (u.email && u.email.toLowerCase() === usuarioIngresado.toLowerCase());

                    if (coincideIdentificador && u.contrasena === contrasenaIngresada && u.rol === rolSeleccionado) {
                        cuentaEncontrada = u;
                        break;
                    }
                }

                if (!cuentaEncontrada) {
                    alert("Usuario, contraseña o rol incorrectos. Revisá los datos o creá una cuenta.");
                    return;
                }

                localStorage.setItem("usuarioActivo", JSON.stringify(cuentaEncontrada));
                localStorage.setItem("misFavoritos", JSON.stringify(cuentaEncontrada.favoritos || []));

                window.location.href = cuentaEncontrada.rol === "admin" ? "miCuentaAdmin.html" : "miCuentaUser.html";
            }
        });
    }

    // =========================================================================
    // B. BARRA DE NAVEGACIÓN PRINCIPAL (index.html)
    // =========================================================================
    const pildoraAuth = document.querySelector(".contenedor-pildora-auth");
    const enlaceMiCuentaNav = document.querySelector(
        '.navegacion-principal a[href*="cuenta"], .navegacion-principal a[href*="Cuenta"]'
    );

    if (usuarioActivo) {
        const rutaPanel = usuarioActivo.rol === "admin" ? "miCuentaAdmin.html" : "miCuentaUser.html";

        if (enlaceMiCuentaNav) {
            enlaceMiCuentaNav.href = rutaPanel;
        }

        // Reemplaza "Iniciar sesión" / "Crear cuenta" por el botón con tu ícono de perfil
        // Reemplaza "Iniciar sesión" / "Crear cuenta" por el botón con tu ícono de perfil
        if (pildoraAuth && pildoraAuth.querySelector('a[href="login.html"]')) {
            const etiquetaRol = usuarioActivo.rol === "admin" ? " (Admin)" : "";
            pildoraAuth.innerHTML = `
    <a href="${rutaPanel}" class="boton-perfil-activo" title="Ir a mi cuenta (${usuarioActivo.nombre})">
        <span class="icono-usuario-header">
            <img src="img/user.png" onerror="this.onerror=null;this.src='img/user (1).png';" alt="Perfil">
        </span>
    </a>
`;
        }
    } else {
        if (enlaceMiCuentaNav) {
            enlaceMiCuentaNav.href = "login.html";
        }
    }

    // =========================================================================
    // C. CARGAR, EDITAR DATOS Y ESTADÍSTICAS (miCuentaUser.html y miCuentaAdmin.html)
    // =========================================================================
    const seccionDatos = document.getElementById("mis-datos");

    if (seccionDatos) {
        if (!usuarioActivo) {
            window.location.href = "login.html";
            return;
        }

        const saludoNombre = document.getElementById("saludo-nombre");
        const campoNombre = document.getElementById("campo-nombre");
        const campoApellido = document.getElementById("campo-apellido");
        const campoEmail = document.getElementById("campo-email");
        const campoTelefono = document.getElementById("campo-telefono");

        if (saludoNombre) saludoNombre.textContent = usuarioActivo.nombre;
        if (campoNombre) campoNombre.value = usuarioActivo.nombre || "";
        if (campoApellido) campoApellido.value = usuarioActivo.apellido || "";
        if (campoEmail) campoEmail.value = usuarioActivo.email || "";
        if (campoTelefono) campoTelefono.value = usuarioActivo.telefono || "";

        // Contadores del banner superior (Usuario y Admin)
        const statFavs = document.getElementById("cant-favoritos") || document.getElementById("stat-favoritos");
        if (statFavs) {
            const favs = JSON.parse(localStorage.getItem("misFavoritos")) || [];
            statFavs.textContent = favs.length;
        }

        const statCarrito = document.getElementById("cant-carrito") || document.getElementById("stat-carrito");
        if (statCarrito) {
            const carrito = JSON.parse(localStorage.getItem("miCarrito")) || [];
            statCarrito.textContent = carrito.reduce((acc, item) => acc + item.cantidad, 0);
        }

        const statObrasAdmin = document.getElementById("stat-obras-admin");
        if (statObrasAdmin) {
            const obrasAdmin = JSON.parse(localStorage.getItem("obrasAdmin")) || [];
            statObrasAdmin.textContent = obrasAdmin.filter(ev => ev.creador === usuarioActivo.usuario).length;
        }

        // Guardar cambios del formulario "Datos Personales"
        const formDatos = seccionDatos.querySelector("form");
        if (formDatos) {
            formDatos.addEventListener("submit", (e) => {
                e.preventDefault();

                usuarioActivo.nombre = campoNombre.value.trim();
                usuarioActivo.apellido = campoApellido.value.trim();
                usuarioActivo.email = campoEmail.value.trim();
                usuarioActivo.telefono = campoTelefono.value.trim();

                localStorage.setItem("usuarioActivo", JSON.stringify(usuarioActivo));

                for (let i = 0; i < usuariosGuardados.length; i++) {
                    if (
                        usuariosGuardados[i].usuario === usuarioActivo.usuario &&
                        usuariosGuardados[i].rol === usuarioActivo.rol
                    ) {
                        usuariosGuardados[i] = usuarioActivo;
                        break;
                    }
                }
                localStorage.setItem("usuariosClicket", JSON.stringify(usuariosGuardados));

                if (saludoNombre) saludoNombre.textContent = usuarioActivo.nombre;
                alert("¡Tus datos se guardaron correctamente!");
            });
        }
    }

    // =========================================================================
    // D. CERRAR SESIÓN
    // =========================================================================
    const enlacesTodos = document.querySelectorAll("a, button");
    for (let i = 0; i < enlacesTodos.length; i++) {
        const texto = enlacesTodos[i].textContent.trim().toLowerCase();
        if (texto === "cerrar sesión" || enlacesTodos[i].id === "btn-salir-top") {
            enlacesTodos[i].addEventListener("click", (e) => {
                e.preventDefault();
                sincronizarFavoritosDeCuenta();
                localStorage.removeItem("usuarioActivo");
                localStorage.removeItem("misFavoritos");
                window.location.href = "index.html";
            });
        }
    }
});
