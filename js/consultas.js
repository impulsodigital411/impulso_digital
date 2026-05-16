// TODO: Activar cuando esté listo el login real.
// const session = localStorage.getItem("impulso_admin_session");
// if (!session) {
//     window.location.href = "login.html";
// }

let consultas = [];

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

function renderizarConsultas(lista) {
    const tbody = document.getElementById("tablaConsultasBody");
    if (!tbody) return;

    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="table__empty">No hay consultas registradas</td></tr>`;
        return;
    }

    tbody.innerHTML = lista.map(c => `
        <tr>
            <td>${escaparHTML(formatearFecha(c.created_at))}</td>
            <td>
                <div class="cliente">
                    <strong>${escaparHTML(c.nombre_cliente || "Sin nombre")}</strong>
                    <span>${escaparHTML(c.email || "Sin email")}</span>
                </div>
            </td>
            <td>${escaparHTML(c.telefono || "-")}</td>
            <td>${escaparHTML(c.servicio || "Consulta general")}</td>
            <td class="table__msg" title="${escaparHTML(c.mensaje)}">${escaparHTML(c.mensaje || "-")}</td>
            <td><span class="estado estado-${escaparHTML(c.estado)}">${obtenerEstadoLabel(c.estado)}</span></td>
            <td>
                <div class="acciones">
                    <button class="acciones__btn acciones__btn--pendiente" data-id="${escaparHTML(c.id)}" data-estado="pendiente" type="button">Pendiente</button>
                    <button class="acciones__btn acciones__btn--respondida" data-id="${escaparHTML(c.id)}" data-estado="respondido" type="button">Respondido</button>
                    <button class="acciones__btn acciones__btn--eliminar" data-id="${escaparHTML(c.id)}" type="button">Eliminar</button>
                </div>
            </td>
        </tr>
    `).join("");
}

function renderizarError(mensaje) {
    const tbody = document.getElementById("tablaConsultasBody");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="7" class="table__empty">${escaparHTML(mensaje)}</td></tr>`;
}

async function cargarConsultas() {
    renderizarError("Cargando consultas...");

    try {
        const data = await obtenerConsultasDesdeSupabase();
        consultas = data.map(normalizarConsulta);
        filtrarConsultas();
    } catch (error) {
        console.error(error);
        consultas = [];
        actualizarTotal(0);
        renderizarError("No se pudieron cargar las consultas. Revisá la conexión y las policies de Supabase.");
    }
}

function filtrarConsultas() {
    const filtroEstado = document.getElementById("filtroEstado")?.value || "todas";
    const buscador = (document.getElementById("buscadorConsultas")?.value || "").toLowerCase().trim();

    let filtradas = [...consultas];

    if (filtroEstado !== "todas") {
        filtradas = filtradas.filter(c => c.estado === filtroEstado);
    }

    if (buscador) {
        filtradas = filtradas.filter(c =>
            (c.nombre_cliente || "").toLowerCase().includes(buscador) ||
            (c.telefono || "").toLowerCase().includes(buscador) ||
            (c.email || "").toLowerCase().includes(buscador) ||
            (c.servicio || "").toLowerCase().includes(buscador) ||
            (c.estado || "").toLowerCase().includes(buscador) ||
            (c.mensaje || "").toLowerCase().includes(buscador)
        );
    }

    renderizarConsultas(filtradas);
    actualizarTotal(filtradas.length);
}

async function cambiarEstado(id, nuevoEstado) {
    try {
        const { error } = await db
            .from("consultas")
            .update({ estado: nuevoEstado })
            .eq("id", id);

        if (error) throw error;
        await cargarConsultas();
    } catch (error) {
        console.error(error);
        alert("No se pudo actualizar el estado de la consulta.");
    }
}

async function eliminarConsulta(id) {
    if (!confirm("¿Eliminar esta consulta?")) return;

    try {
        const { error } = await db
            .from("consultas")
            .delete()
            .eq("id", id);

        if (error) throw error;
        await cargarConsultas();
    } catch (error) {
        console.error(error);
        alert("No se pudo eliminar la consulta.");
    }
}

function actualizarTotal(cantidad) {
    const totalEl = document.getElementById("totalConsultas");
    if (totalEl) totalEl.textContent = cantidad;
}

function cerrarSesion() {
    // Temporal: no hay login real todavia. Se vuelve al sitio publico.
    localStorage.removeItem("impulso_admin_session");
    window.location.href = "../index.html";
}

document.addEventListener("DOMContentLoaded", () => {
    cargarConsultas();

    document.getElementById("filtroEstado")?.addEventListener("change", filtrarConsultas);
    document.getElementById("buscadorConsultas")?.addEventListener("input", filtrarConsultas);

    document.getElementById("tablaConsultasBody")?.addEventListener("click", (e) => {
        const botonEstado = e.target.closest(".acciones__btn[data-estado]");
        const botonEliminar = e.target.closest(".acciones__btn--eliminar");

        if (botonEstado) {
            cambiarEstado(botonEstado.dataset.id, botonEstado.dataset.estado);
            return;
        }

        if (botonEliminar) {
            eliminarConsulta(botonEliminar.dataset.id);
        }
    });

    document.getElementById("btnCerrarSesion")?.addEventListener("click", cerrarSesion);
});
