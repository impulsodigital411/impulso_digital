// TODO: Activar cuando esté listo el login real.
// const session = localStorage.getItem("impulso_admin_session");
// if (!session) {
//     window.location.href = "login.html";
// }

const STORAGE_KEY = "impulso_consultas_demo";

const consultasDemo = [
    {
        id: 1,
        fecha: "2026-05-14",
        nombre: "Juan Perez",
        telefono: "2645000001",
        email: "juan@ejemplo.com",
        servicio: "Desarrollo de pagina web",
        mensaje: "Quiero consultar por una pagina para mi negocio.",
        estado: "pendiente"
    },
    {
        id: 2,
        fecha: "2026-05-13",
        nombre: "Maria Gomez",
        telefono: "2645000002",
        email: "maria@ejemplo.com",
        servicio: "Gestion de redes sociales",
        mensaje: "Necesito ayuda con publicaciones para Instagram.",
        estado: "respondida"
    },
    {
        id: 3,
        fecha: "2026-05-12",
        nombre: "Carlos Diaz",
        telefono: "2645000003",
        email: "carlos@ejemplo.com",
        servicio: "Publicidad digital",
        mensaje: "Quiero informacion sobre campanas pagas.",
        estado: "pendiente"
    },
    {
        id: 4,
        fecha: "2026-05-11",
        nombre: "Lucia Fernandez",
        telefono: "2645000004",
        email: "lucia@ejemplo.com",
        servicio: "Identidad visual",
        mensaje: "Necesito logo y placas para redes.",
        estado: "cancelada"
    }
];

const serviciosActivos = 6;

function obtenerConsultas() {
    const guardadas = localStorage.getItem(STORAGE_KEY);

    if (!guardadas) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(consultasDemo));
        return [...consultasDemo];
    }

    try {
        const datos = JSON.parse(guardadas);
        return Array.isArray(datos) ? datos : [...consultasDemo];
    } catch (error) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(consultasDemo));
        return [...consultasDemo];
    }
}

function obtenerEstadoLabel(estado) {
    const labels = {
        pendiente: "Pendiente",
        respondida: "Respondida",
        cancelada: "Cancelada"
    };

    return labels[estado] || "Pendiente";
}

function calcularResumen(consultas) {
    return {
        total: consultas.length,
        pendientes: consultas.filter(c => c.estado === "pendiente").length,
        respondidas: consultas.filter(c => c.estado === "respondida").length
    };
}

function cargarDashboard() {
    const consultas = obtenerConsultas();
    const resumen = calcularResumen(consultas);

    document.getElementById("totalConsultas").textContent = resumen.total;
    document.getElementById("consultasPendientes").textContent = resumen.pendientes;
    document.getElementById("consultasRespondidas").textContent = resumen.respondidas;
    document.getElementById("serviciosActivos").textContent = serviciosActivos;

    cargarUltimasConsultas(consultas);
    cargarActividadReciente(consultas, resumen);
}

function cargarUltimasConsultas(consultas) {
    const tbody = document.getElementById("tablaUltimasConsultasBody");
    if (!tbody) return;

    const ultimas = [...consultas]
        .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)))
        .slice(0, 5);

    if (ultimas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="table__empty">Todavia no hay consultas.</td></tr>`;
        return;
    }

    tbody.innerHTML = ultimas.map(c => `
        <tr>
            <td>${c.fecha || "-"}</td>
            <td>
                <div class="cliente">
                    <strong>${c.nombre || "Sin nombre"}</strong>
                    <span>${c.telefono || "Sin telefono"}</span>
                </div>
            </td>
            <td>${c.servicio || "Consulta general"}</td>
            <td><span class="estado estado-${c.estado}">${obtenerEstadoLabel(c.estado)}</span></td>
        </tr>
    `).join("");
}

function cargarActividadReciente(consultas, resumen) {
    const contenedor = document.getElementById("actividadReciente");
    if (!contenedor) return;

    const ultima = consultas[0];
    const items = [
        {
            titulo: `${resumen.pendientes} consultas pendientes`,
            detalle: "Prioridad operativa para el proximo seguimiento."
        },
        {
            titulo: `${resumen.respondidas} consultas respondidas`,
            detalle: "Gestion registrable hasta migrar a base de datos."
        },
        {
            titulo: ultima ? `Ultimo contacto: ${ultima.nombre}` : "Sin actividad nueva",
            detalle: ultima ? `${ultima.servicio || "Consulta general"} - ${ultima.fecha || "sin fecha"}` : "Esperando nuevas consultas desde el sitio publico."
        }
    ];

    contenedor.innerHTML = items.map(item => `
        <div class="activity-item">
            <span class="activity-item__dot"></span>
            <div>
                <strong>${item.titulo}</strong>
                <span>${item.detalle}</span>
            </div>
        </div>
    `).join("");
}

function cerrarSesion() {
    // Temporal: no hay login real todavia. Se vuelve al sitio publico.
    localStorage.removeItem("impulso_admin_session");
    window.location.href = "../index.html";
}

document.addEventListener("DOMContentLoaded", () => {
    cargarDashboard();
    document.getElementById("btnCerrarSesion")?.addEventListener("click", cerrarSesion);
});
