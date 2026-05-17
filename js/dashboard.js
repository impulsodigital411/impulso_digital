const CONSULTAS_SELECT = "id,nombre_cliente,telefono,email,servicio_consultado,mensaje,estado,fecha_consulta";

function obtenerSupabaseClient() {
    if (typeof db === "undefined" || typeof db.from !== "function") {
        throw new Error("No se pudo iniciar la conexión con Supabase. Revisá js/supabase.js.");
    }

    return db;
}

function normalizarEstado(estado) {
    const valor = String(estado || "pendiente").trim().toLowerCase();

    if (valor === "respondida" || valor === "respondido") return "respondido";
    if (valor === "pendiente") return "pendiente";

    return valor || "pendiente";
}

function obtenerEstadoLabel(estado) {
    const labels = {
        pendiente: "Pendiente",
        respondido: "Respondido"
    };

    return labels[normalizarEstado(estado)] || "Pendiente";
}

function normalizarConsulta(consulta) {
    const servicioConsultado = consulta.servicio_consultado || "Consulta general";

    return {
        id: consulta.id,
        nombre_cliente: consulta.nombre_cliente || "",
        telefono: consulta.telefono || "",
        email: consulta.email || "",
        servicio_consultado: servicioConsultado,
        mensaje: consulta.mensaje || "",
        estado: normalizarEstado(consulta.estado),
        fecha_consulta: consulta.fecha_consulta || ""
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
    const supabaseClient = obtenerSupabaseClient();
    const { data, error } = await supabaseClient
        .from("consultas")
        .select(CONSULTAS_SELECT)
        .order("fecha_consulta", { ascending: false, nullsFirst: false });

    if (error) throw error;

    return data || [];
}

function obtenerMensajeErrorCarga(error) {
    const mensaje = String(error?.message || "").toLowerCase();

    if (mensaje.includes("row-level security") || mensaje.includes("permission denied")) {
        return "No se pudieron cargar las consultas. Revisá la policy SELECT de Supabase.";
    }

    if (mensaje.includes("column") || mensaje.includes("schema cache")) {
        return "No se pudieron cargar las consultas. Revisá las columnas de public.consultas.";
    }

    return "No se pudieron cargar las consultas. Revisá la conexión con Supabase.";
}

function registrarErrorCargaConsultas(error) {
    console.error("[Dashboard] Error al leer public.consultas desde Supabase", {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code,
        error
    });
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
        registrarErrorCargaConsultas(error);
        document.getElementById("totalConsultas").textContent = "0";
        document.getElementById("consultasPendientes").textContent = "0";
        document.getElementById("consultasRespondidas").textContent = "0";
        document.getElementById("ultimasConsultas").textContent = "0";
        cargarUltimasConsultas([], obtenerMensajeErrorCarga(error));
        cargarActividadReciente([], { pendientes: 0, respondidas: 0 });
    }
}

function cargarUltimasConsultas(consultas, mensajeVacio = "No hay consultas registradas") {
    const tbody = document.getElementById("tablaUltimasConsultasBody");
    if (!tbody) return;

    const ultimas = consultas.slice(0, 5);

    if (ultimas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="table__empty">${escaparHTML(mensajeVacio)}</td></tr>`;
        return;
    }

    tbody.innerHTML = ultimas.map(c => `
        <tr>
            <td>${escaparHTML(formatearFecha(c.fecha_consulta))}</td>
            <td>
                <div class="cliente">
                    <strong>${escaparHTML(c.nombre_cliente || "Sin nombre")}</strong>
                    <span>${escaparHTML(c.telefono || "Sin telefono")}</span>
                </div>
            </td>
            <td>${escaparHTML(c.servicio_consultado || "Consulta general")}</td>
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
            detalle: ultima ? `${ultima.servicio_consultado || "Consulta general"} - ${formatearFecha(ultima.fecha_consulta)}` : "Esperando nuevas consultas desde el sitio publico."
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

document.addEventListener("DOMContentLoaded", async () => {
    if (typeof window.ensureAdminSession === "function") {
        const autorizado = await window.ensureAdminSession();
        if (!autorizado) return;
    }

    cargarDashboard();
});
