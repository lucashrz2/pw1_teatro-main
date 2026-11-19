

// =========================================================
// 1. SINCRONIZAR FAVORITOS DE LA CUENTA ACTIVA
// =========================================================
function sincronizarFavoritosDeCuenta() {
    const sesion = JSON.parse(localStorage.getItem('sesion'));
    if (!sesion) return;

    const cuentas = JSON.parse(localStorage.getItem('cuentas')) || [];
    const index = cuentas.findIndex(c => c.usuario === sesion.usuario && c.rol === sesion.rol);
    const favsActuales = JSON.parse(localStorage.getItem('misFavoritos')) || [];

    sesion.favoritos = favsActuales;
    localStorage.setItem('sesion', JSON.stringify(sesion));

    if (index !== -1) {
        cuentas[index].favoritos = favsActuales;
        localStorage.setItem('cuentas', JSON.stringify(cuentas));
    }
}

// Cada vez que hace clic en la página (ej. agregar o quitar favorito), guarda el respaldo en su cuenta
document.addEventListener('click', () => {
    setTimeout(sincronizarFavoritosDeCuenta, 50);
});

// =========================================================
// 2. REGISTRO E INICIO DE SESIÓN (login.html / registroCuentas.html)
// =========================================================
const formAuth = document.querySelector('.formulario-autenticacion');

if (formAuth) {
    formAuth.addEventListener('submit', (e) => {
        e.preventDefault();

        const rol = document.querySelector('input[name="rol"]:checked').value;
        const usuario = document.getElementById('campo-usuario').value.trim();
        const contrasena = document.getElementById('campo-contrasena').value;
        const cuentas = JSON.parse(localStorage.getItem('cuentas')) || [];

        // REGISTRO
        if (document.getElementById('campo-nombre')) {
            const nombre = document.getElementById('campo-nombre').value.trim();
            const apellido = document.getElementById('campo-apellido').value.trim();

            // Validar que no exista ya ese usuario/email para ese rol
            const yaExiste = cuentas.some(
                c => c.usuario.toLowerCase() === usuario.toLowerCase() && c.rol === rol
            );
            if (yaExiste) {
                alert('Ya existe una cuenta registrada con ese usuario o email.');
                return;
            }

            const nuevaCuenta = { rol, usuario, nombre, apellido, contrasena, favoritos: [] };
            cuentas.push(nuevaCuenta);

            localStorage.setItem('cuentas', JSON.stringify(cuentas));
            localStorage.setItem('sesion', JSON.stringify(nuevaCuenta));
            localStorage.setItem('misFavoritos', JSON.stringify([]));

            window.location.href = rol === 'admin' ? 'miCuentaAdmin.html' : 'miCuentaUser.html';
        }
        // LOGIN
        else {
            const encontrada = cuentas.find(
                c => c.usuario === usuario && c.contrasena === contrasena && c.rol === rol
            );

            if (!encontrada) {
                alert('Datos o rol incorrectos');
                return;
            }

            localStorage.setItem('sesion', JSON.stringify(encontrada));
            // Restaura los favoritos propios de esta cuenta (o vacío si no tenía)
            localStorage.setItem('misFavoritos', JSON.stringify(encontrada.favoritos || []));

            window.location.href = rol === 'admin' ? 'miCuentaAdmin.html' : 'miCuentaUser.html';
        }
    });
}

// =========================================================
// 3. EDITAR DATOS Y CERRAR SESIÓN (miCuentaUser.html / miCuentaAdmin.html)
// =========================================================
const formDatos = document.querySelector('#mis-datos form');

if (formDatos) {
    const sesion = JSON.parse(localStorage.getItem('sesion'));

    if (sesion) {
        document.getElementById('campo-nombre').value = sesion.nombre || '';
        document.getElementById('campo-apellido').value = sesion.apellido || '';
        document.getElementById('campo-email').value = sesion.email || sesion.usuario || '';
        document.getElementById('campo-telefono').value = sesion.telefono || '';
    }

    formDatos.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!sesion) return;

        const cuentas = JSON.parse(localStorage.getItem('cuentas')) || [];
        const index = cuentas.findIndex(c => c.usuario === sesion.usuario && c.rol === sesion.rol);

        sesion.nombre = document.getElementById('campo-nombre').value.trim();
        sesion.apellido = document.getElementById('campo-apellido').value.trim();
        sesion.email = document.getElementById('campo-email').value.trim();
        sesion.telefono = document.getElementById('campo-telefono').value.trim();

        localStorage.setItem('sesion', JSON.stringify(sesion));
        if (index !== -1) {
            cuentas[index] = { ...cuentas[index], ...sesion };
            localStorage.setItem('cuentas', JSON.stringify(cuentas));
        }

        alert('Datos actualizados');
    });
}

// Botón "Cerrar Sesión" en el menú lateral
document.querySelectorAll('.barra-lateral-cuenta a').forEach(enlace => {
    if (enlace.textContent.trim().toLowerCase() === 'cerrar sesión') {
        enlace.addEventListener('click', (e) => {
            e.preventDefault();
            sincronizarFavoritosDeCuenta();      // 1. Guarda sus favoritos en su cuenta
            localStorage.removeItem('sesion');   // 2. Cierra la sesión
            localStorage.removeItem('misFavoritos'); // 3. Vacía los favoritos en pantalla
            window.location.href = 'index.html';
        });
    }
});

// =========================================================
// 4. REDIRECCIÓN DEL ENLACE "MI CUENTA" EN EL NAVBAR
// =========================================================
const enlaceMiCuenta = document.querySelector('a[href="cuenta-usuario.html"]');

if (enlaceMiCuenta) {
    enlaceMiCuenta.addEventListener('click', (e) => {
        e.preventDefault();
        const sesion = JSON.parse(localStorage.getItem('sesion'));

        if (!sesion) {
            window.location.href = 'login.html';
        } else if (sesion.rol === 'admin') {
            window.location.href = 'miCuentaAdmin.html';
        } else {
            window.location.href = 'miCuentaUser.html';
        }
    });
}

// =========================================================
// 5. COMPLETAR BANNER DE PERFIL Y BOTÓN SALIR SUPERIOR
// =========================================================
const sesionBanner = JSON.parse(localStorage.getItem('sesion'));

if (sesionBanner) {
    const saludoEl = document.getElementById('saludo-nombre');
    if (saludoEl) saludoEl.textContent = sesionBanner.nombre || sesionBanner.usuario;

    const statFavs = document.getElementById('stat-favoritos');
    if (statFavs) {
        const favs = JSON.parse(localStorage.getItem('misFavoritos')) || [];
        statFavs.textContent = favs.length;
    }

    const statCarrito = document.getElementById('stat-carrito');
    if (statCarrito) {
        const carrito = JSON.parse(localStorage.getItem('miCarrito')) || [];
        statCarrito.textContent = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    }

    const statObrasAdmin = document.getElementById('stat-obras-admin');
    if (statObrasAdmin) {
        const obrasAdmin = JSON.parse(localStorage.getItem('obrasAdmin')) || [];
        statObrasAdmin.textContent = obrasAdmin.filter(ev => ev.creador === sesionBanner.usuario).length;
    }
}

const btnSalirTop = document.getElementById('btn-salir-top');
if (btnSalirTop) {
    btnSalirTop.addEventListener('click', (e) => {
        e.preventDefault();
        sincronizarFavoritosDeCuenta();
        localStorage.removeItem('sesion');
        localStorage.removeItem('misFavoritos');
        window.location.href = 'index.html';
    });
}