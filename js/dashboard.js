// TODO: Activar cuando esté listo el login real.
// const session = localStorage.getItem("impulso_admin_session");
// if (!session) {
//     window.location.href = "login.html";
// }

function obtenerEstadoLabel(estado) {
    const labels = {
        pendiente: "Pendiente",
        respondido: "Respondido"
    };

    return labels[estado] || "Pendiente";
}

function normalizarConsulta(consulta) {
    const estado = consulta.estado === "respondida" ? "respondido" : (consulta.estado || "pendiente");

    return {
        id: consulta.id,
        nombre_cliente: consulta.nombre_cliente || consulta.nombre || "",
        telefono: consulta.telefono || "",
        email: consulta.email || "",
        servicio: consulta.servicio || consulta.servicio_consultado || "",
        mensaje: consulta.mensaje || "",
        estado,
        created_at: consulta.created_at || consulta.fecha_consulta || ""
    };
}

function escaparHTML(valor) {
    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function formatearFecha(valor) {
    if (!valor) return "-";

    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) return "-";

    return fecha.toLocaleString("es-AR", {
        dateStyle: "short",
        timeStyle: "short"
    });
}

async function obtenerConsultasDesdeSupabase() {
    if (typeof db === "undefined") {
        throw new Error("No se pudo iniciar la conexión con Supabase.");
    }

    const resultado = await db
        .from("consultas")
        .select("*")
        .order("created_at", { ascending: false });

    if (!resultado.error) return resultado.data || [];

    if (String(resultado.error.message || "").includes("created_at")) {
        const fallback = await db
            .from("consultas")
            .select("*")
            .order("fecha_consulta", { ascending: false });

        if (!fallback.error) return fallback.data || [];
        throw fallback.error;
    }

    throw resultado.error;
}

function calcularResumen(consultas) {
    const ultimas = consultas.slice(0, 5);

    return {
        total: consultas.length,
        pendientes: consultas.filter(c => c.estado === "pendiente").length,
        respondidas: consultas.filter(c => c.estado === "respondido").length,
        ultimas: ultimas.length
    };
}

async function cargarDashboard() {
    try {
        const data = await obtenerConsultasDesdeSupabase();
        const consultas = data.map(normalizarConsulta);
        const resumen = calcularResumen(consultas);

        document.getElementById("totalConsultas").textContent = resumen.total;
        document.getElementById("consultasPendientes").textContent = resumen.pendientes;
        document.getElementById("consultasRespondidas").textContent = resumen.respondidas;
        document.getElementById("ultimasConsultas").textContent = resumen.ultimas;

        cargarUltimasConsultas(consultas);
        cargarActividadReciente(consultas, resumen);
    } catch (error) {
        console.error(error);
        document.getElementById("totalConsultas").textContent = "0";
        document.getElementById("consultasPendientes").textContent = "0";
        document.getElementById("consultasRespondidas").textContent = "0";
        document.getElementById("ultimasConsultas").textContent = "0";
        cargarUltimasConsultas([]);
        cargarActividadReciente([], { pendientes: 0, respondidas: 0 });
    }
}

function cargarUltimasConsultas(consultas) {
    const tbody = document.getElementById("tablaUltimasConsultasBody");
    if (!tbody) return;

    const ultimas = consultas.slice(0, 5);

    if (ultimas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="table__empty">No hay consultas registradas</td></tr>`;
        return;
    }

    tbody.innerHTML = ultimas.map(c => `
        <tr>
            <td>${escaparHTML(formatearFecha(c.created_at))}</td>
            <td>
                <div class="cliente">
                    <strong>${escaparHTML(c.nombre_cliente || "Sin nombre")}</strong>
                    <span>${escaparHTML(c.telefono || "Sin telefono")}</span>
                </div>
            </td>
            <td>${escaparHTML(c.servicio || "Consulta general")}</td>
            <td><span class="estado estado-${escaparHTML(c.estado)}">${obtenerEstadoLabel(c.estado)}</span></td>
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
            detalle: "Solicitudes que requieren seguimiento."
        },
        {
            titulo: `${resumen.respondidas} consultas respondidas`,
            detalle: "Mensajes marcados como gestionados."
        },
        {
            titulo: ultima ? `Ultimo contacto: ${ultima.nombre_cliente}` : "Sin actividad nueva",
            detalle: ultima ? `${ultima.servicio || "Consulta general"} - ${formatearFecha(ultima.created_at)}` : "Esperando nuevas consultas desde el sitio publico."
        }
    ];

    contenedor.innerHTML = items.map(item => `
        <div class="activity-item">
            <span class="activity-item__dot"></span>
            <div>
                <strong>${escaparHTML(item.titulo)}</strong>
                <span>${escaparHTML(item.detalle)}</span>
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
