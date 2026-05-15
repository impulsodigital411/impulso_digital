// TODO: Activar cuando esté listo el login.
// const session = localStorage.getItem("impulso_admin_session");
// if (!session) {
//     window.location.href = "login.html";
// }

// TODO: Reemplazar datos simulados por consulta real a Supabase.
// TODO: Usar obtenerConsultas() desde supabaseClient.js.
// TODO: Usar actualizarEstadoConsulta() para cambiar estados.
// TODO: Usar eliminarConsulta() para eliminar o archivar registros.

let consultas = [
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
    },
    {
        id: 4,
        fecha: "2026-05-11",
        nombre: "Lucía Fernández",
        telefono: "2645000004",
        servicio: "Identidad visual",
        mensaje: "Necesito logo y placas para redes.",
        estado: "cancelada"
    }
];

function renderizarConsultas(lista) {
    const tbody = document.getElementById("tablaConsultasBody");
    if (!tbody) return;

    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="table__empty">No se encontraron consultas.</td></tr>`;
        return;
    }

    tbody.innerHTML = lista.map(c => {
        const estadoLabel = c.estado.charAt(0).toUpperCase() + c.estado.slice(1);
        return `
            <tr>
                <td>${c.fecha}</td>
                <td>${c.nombre}</td>
                <td>${c.telefono}</td>
                <td>${c.servicio}</td>
                <td class="table__msg">${c.mensaje}</td>
                <td><span class="estado estado-${c.estado}">${estadoLabel}</span></td>
                <td>
                    <div class="acciones">
                        <button class="acciones__btn acciones__btn--pendiente" data-id="${c.id}" data-estado="pendiente" title="Marcar pendiente">Pendiente</button>
                        <button class="acciones__btn acciones__btn--respondida" data-id="${c.id}" data-estado="respondida" title="Marcar respondida">Respondida</button>
                        <button class="acciones__btn acciones__btn--cancelada" data-id="${c.id}" data-estado="cancelada" title="Cancelar">Cancelar</button>
                        <button class="acciones__btn acciones__btn--eliminar" data-id="${c.id}" title="Eliminar">Eliminar</button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");

    document.querySelectorAll(".acciones__btn--pendiente, .acciones__btn--respondida, .acciones__btn--cancelada").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = parseInt(e.target.dataset.id);
            const nuevoEstado = e.target.dataset.estado;
            cambiarEstado(id, nuevoEstado);
        });
    });

    document.querySelectorAll(".acciones__btn--eliminar").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = parseInt(e.target.dataset.id);
            eliminarConsulta(id);
        });
    });
}

function cargarConsultas() {
    renderizarConsultas(consultas);
    actualizarTotal();
}

function filtrarConsultas() {
    const filtroEstado = document.getElementById("filtroEstado").value;
    const buscador = document.getElementById("buscadorConsultas").value.toLowerCase().trim();

    let filtradas = consultas;

    if (filtroEstado !== "todas") {
        filtradas = filtradas.filter(c => c.estado === filtroEstado);
    }

    if (buscador) {
        filtradas = filtradas.filter(c =>
            c.nombre.toLowerCase().includes(buscador) ||
            c.telefono.includes(buscador) ||
            c.servicio.toLowerCase().includes(buscador)
        );
    }

    renderizarConsultas(filtradas);
    actualizarTotal(filtradas.length);
}

function cambiarEstado(id, nuevoEstado) {
    const consulta = consultas.find(c => c.id === id);
    if (consulta) {
        consulta.estado = nuevoEstado;
        filtrarConsultas();
    }
}

function eliminarConsulta(id) {
    consultas = consultas.filter(c => c.id !== id);
    filtrarConsultas();
}

function actualizarTotal(cantidad) {
    const totalEl = document.getElementById("totalConsultas");
    if (totalEl) {
        totalEl.textContent = cantidad !== undefined ? cantidad : consultas.length;
    }
}

function cerrarSesion() {
    localStorage.removeItem("impulso_admin_session");
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
    cargarConsultas();

    document.getElementById("filtroEstado").addEventListener("change", filtrarConsultas);
    document.getElementById("buscadorConsultas").addEventListener("input", filtrarConsultas);

    const btnCerrar = document.getElementById("btnCerrarSesion");
    if (btnCerrar) {
        btnCerrar.addEventListener("click", cerrarSesion);
    }
});
