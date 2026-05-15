// TODO: Activar cuando esté listo el login real.
// const session = localStorage.getItem("impulso_admin_session");
// if (!session) {
//     window.location.href = "login.html";
// }

// Persistencia temporal hasta conectar base de datos/API.
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

let consultas = cargarDesdeStorage();

function cargarDesdeStorage() {
    const guardadas = localStorage.getItem(STORAGE_KEY);

    if (!guardadas) {
        guardarEnStorage(consultasDemo);
        return [...consultasDemo];
    }

    try {
        const datos = JSON.parse(guardadas);
        return Array.isArray(datos) ? datos : [...consultasDemo];
    } catch (error) {
        guardarEnStorage(consultasDemo);
        return [...consultasDemo];
    }
}

function guardarEnStorage(lista = consultas) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

function obtenerEstadoLabel(estado) {
    const labels = {
        pendiente: "Pendiente",
        respondida: "Respondida",
        cancelada: "Cancelada"
    };

    return labels[estado] || "Pendiente";
}

function renderizarConsultas(lista) {
    const tbody = document.getElementById("tablaConsultasBody");
    if (!tbody) return;

    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="table__empty">No se encontraron consultas.</td></tr>`;
        return;
    }

    tbody.innerHTML = lista.map(c => `
        <tr>
            <td>${c.fecha || "-"}</td>
            <td>
                <div class="cliente">
                    <strong>${c.nombre || "Sin nombre"}</strong>
                    <span>${c.email || "Sin email"}</span>
                </div>
            </td>
            <td>${c.telefono || "-"}</td>
            <td>${c.servicio || "Consulta general"}</td>
            <td class="table__msg" title="${c.mensaje || ""}">${c.mensaje || "-"}</td>
            <td><span class="estado estado-${c.estado}">${obtenerEstadoLabel(c.estado)}</span></td>
            <td>
                <div class="acciones">
                    <button class="acciones__btn acciones__btn--pendiente" data-id="${c.id}" data-estado="pendiente" type="button">Pendiente</button>
                    <button class="acciones__btn acciones__btn--respondida" data-id="${c.id}" data-estado="respondida" type="button">Respondida</button>
                    <button class="acciones__btn acciones__btn--cancelada" data-id="${c.id}" data-estado="cancelada" type="button">Cancelar</button>
                    <button class="acciones__btn acciones__btn--eliminar" data-id="${c.id}" type="button">Eliminar</button>
                </div>
            </td>
        </tr>
    `).join("");

    document.querySelectorAll(".acciones__btn[data-estado]").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = Number(e.currentTarget.dataset.id);
            const nuevoEstado = e.currentTarget.dataset.estado;
            cambiarEstado(id, nuevoEstado);
        });
    });

    document.querySelectorAll(".acciones__btn--eliminar").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = Number(e.currentTarget.dataset.id);
            eliminarConsulta(id);
        });
    });
}

function cargarConsultas() {
    filtrarConsultas();
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
            (c.nombre || "").toLowerCase().includes(buscador) ||
            (c.telefono || "").toLowerCase().includes(buscador) ||
            (c.email || "").toLowerCase().includes(buscador) ||
            (c.servicio || "").toLowerCase().includes(buscador) ||
            (c.mensaje || "").toLowerCase().includes(buscador)
        );
    }

    renderizarConsultas(filtradas);
    actualizarTotal(filtradas.length);
}

function cambiarEstado(id, nuevoEstado) {
    consultas = consultas.map(consulta => (
        consulta.id === id ? { ...consulta, estado: nuevoEstado } : consulta
    ));
    guardarEnStorage();
    filtrarConsultas();
}

function eliminarConsulta(id) {
    consultas = consultas.filter(c => c.id !== id);
    guardarEnStorage();
    filtrarConsultas();
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

    document.getElementById("btnCerrarSesion")?.addEventListener("click", cerrarSesion);
});
