// TODO: Activar cuando esté listo el login.
// const session = localStorage.getItem("impulso_admin_session");
// if (!session) {
//     window.location.href = "login.html";
// }

const consultas = [
    {
        id: 1,
        fecha: "2026-05-14",
        nombre: "Juan Pérez",
        telefono: "2645000001",
        servicio: "Diseño de página web",
        mensaje: "Quiero consultar por una página para mi negocio.",
        estado: "pendiente"
    },
    {
        id: 2,
        fecha: "2026-05-13",
        nombre: "María Gómez",
        telefono: "2645000002",
        servicio: "Gestión de redes sociales",
        mensaje: "Necesito ayuda con publicaciones para Instagram.",
        estado: "respondida"
    },
    {
        id: 3,
        fecha: "2026-05-12",
        nombre: "Carlos Díaz",
        telefono: "2645000003",
        servicio: "Publicidad digital",
        mensaje: "Quiero información sobre campañas pagas.",
        estado: "pendiente"
    }
];

const serviciosActivos = 6;

function calcularResumen() {
    const total = consultas.length;
    const pendientes = consultas.filter(c => c.estado === "pendiente").length;
    const respondidas = consultas.filter(c => c.estado === "respondida").length;

    return { total, pendientes, respondidas };
}

function cargarDashboard() {
    const resumen = calcularResumen();

    document.getElementById("totalConsultas").textContent = resumen.total;
    document.getElementById("consultasPendientes").textContent = resumen.pendientes;
    document.getElementById("consultasRespondidas").textContent = resumen.respondidas;
    document.getElementById("serviciosActivos").textContent = serviciosActivos;

    cargarUltimasConsultas();
}

function cargarUltimasConsultas() {
    const tbody = document.getElementById("tablaUltimasConsultasBody");
    if (!tbody) return;

    const ultimas = consultas.slice(0, 5);

    tbody.innerHTML = ultimas.map(c => {
        const estadoLabel = c.estado.charAt(0).toUpperCase() + c.estado.slice(1);
        return `
            <tr>
                <td>${c.fecha}</td>
                <td>${c.nombre}</td>
                <td>${c.servicio}</td>
                <td><span class="estado estado-${c.estado}">${estadoLabel}</span></td>
            </tr>
        `;
    }).join("");
}

function cerrarSesion() {
    localStorage.removeItem("impulso_admin_session");
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
    cargarDashboard();

    const btnCerrar = document.getElementById("btnCerrarSesion");
    if (btnCerrar) {
        btnCerrar.addEventListener("click", cerrarSesion);
    }
});
