let consultas = [];
let consultaSeleccionadaId = null;
let feedbackTimer = null;

const CONSULTAS_SELECT = "id,nombre_cliente,telefono,email,servicio_consultado,mensaje,estado,fecha_consulta";

function obtenerSupabaseClient() {
  if (typeof db === "undefined" || typeof db.from !== "function") {
    throw new Error("No se pudo iniciar la conexión con Supabase. Revisá js/supabase.js.");
  }

  return db;
}

function normalizarId(id) {
  const valor = String(id ?? "").trim();
  return valor || null;
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

function obtenerClaseEstado(estado) {
  return normalizarEstado(estado).replace(/[^a-z0-9_-]/g, "");
}

function valorVisible(valor, fallback = "No especificado") {
  const texto = String(valor ?? "").trim();
  return texto || fallback;
}

function normalizarConsulta(consulta) {
  return {
    id: consulta.id,
    nombre_cliente: valorVisible(consulta.nombre_cliente, "Sin nombre"),
    telefono: valorVisible(consulta.telefono),
    email: valorVisible(consulta.email),
    servicio_consultado: valorVisible(consulta.servicio_consultado, "Consulta general"),
    mensaje: valorVisible(consulta.mensaje, "Sin mensaje"),
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

function resumirTexto(valor, max = 110) {
  const texto = String(valor ?? "").replace(/\s+/g, " ").trim();

  if (!texto) return "-";
  if (texto.length <= max) return texto;

  return `${texto.slice(0, max - 3).trim()}...`;
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

function obtenerMensajeErrorAccion(error, accion, policy) {
  const mensaje = String(error?.message || "").toLowerCase();

  if (mensaje.includes("row-level security") || mensaje.includes("permission denied") || mensaje.includes("no eliminó") || mensaje.includes("no actualizó")) {
    return `No se pudo ${accion}. Revisá la policy ${policy} de Supabase.`;
  }

  return `No se pudo ${accion}. Intentá nuevamente.`;
}

function registrarErrorCargaConsultas(error) {
  console.error("[Consultas admin] Error al leer public.consultas desde Supabase", {
    message: error?.message,
    details: error?.details,
    hint: error?.hint,
    code: error?.code,
    error
  });
}

function mostrarFeedback(mensaje, tipo = "info") {
  const feedback = document.getElementById("consultasFeedback");
  if (!feedback) return;

  window.clearTimeout(feedbackTimer);
  feedback.textContent = mensaje;
  feedback.className = `admin-feedback admin-feedback--${tipo}`;

  if (tipo === "success") {
    feedbackTimer = window.setTimeout(limpiarFeedback, 3500);
  }
}

function limpiarFeedback() {
  const feedback = document.getElementById("consultasFeedback");
  if (!feedback) return;

  window.clearTimeout(feedbackTimer);
  feedback.textContent = "";
  feedback.className = "admin-feedback";
}

function obtenerConsultaPorId(id) {
  const consultaId = normalizarId(id);
  if (!consultaId) return null;

  return consultas.find((consulta) => String(consulta.id) === consultaId) || null;
}

function crearBadgeEstado(estado) {
  const badge = document.createElement("span");
  badge.className = `estado estado-${obtenerClaseEstado(estado)}`;
  badge.textContent = obtenerEstadoLabel(estado);
  return badge;
}

function setTexto(id, valor) {
  const el = document.getElementById(id);
  if (el) el.textContent = valor;
}

function renderizarDetalleModal(consulta) {
  setTexto("modalNombreCliente", consulta.nombre_cliente);
  setTexto("modalTelefono", consulta.telefono);
  setTexto("modalEmail", consulta.email);
  setTexto("modalServicio", consulta.servicio_consultado);
  setTexto("modalFecha", formatearFecha(consulta.fecha_consulta));
  setTexto("modalConsultaId", consulta.id || "-");
  setTexto("consultaModalMensaje", consulta.mensaje);

  const estadoEl = document.getElementById("modalEstado");
  if (estadoEl) {
    estadoEl.textContent = "";
    estadoEl.appendChild(crearBadgeEstado(consulta.estado));
  }

  const btnEliminar = document.getElementById("consultaModalEliminar");
  const btnResponder = document.getElementById("consultaModalResponder");
  const consultaId = normalizarId(consulta.id);

  if (btnEliminar) btnEliminar.dataset.id = consultaId || "";
  if (btnResponder) {
    btnResponder.dataset.id = consultaId || "";
    btnResponder.disabled = consulta.estado === "respondido";
    btnResponder.textContent = consulta.estado === "respondido" ? "Consulta respondida" : "Marcar como respondida";
  }
}

function abrirModalConsulta(id) {
  const consulta = obtenerConsultaPorId(id);
  const modal = document.getElementById("consultaModal");

  if (!consulta || !modal) return;

  consultaSeleccionadaId = String(consulta.id);
  renderizarDetalleModal(consulta);
  modal.hidden = false;
  document.body.classList.add("modal-open");
  document.getElementById("consultaModalCerrar")?.focus();
}

function cerrarModalConsulta() {
  const modal = document.getElementById("consultaModal");
  if (!modal || modal.hidden) return;

  modal.hidden = true;
  consultaSeleccionadaId = null;
  document.body.classList.remove("modal-open");
}

function actualizarModalAbierto() {
  const modal = document.getElementById("consultaModal");
  if (!modal || modal.hidden || !consultaSeleccionadaId) return;

  const consulta = obtenerConsultaPorId(consultaSeleccionadaId);
  if (!consulta) {
    cerrarModalConsulta();
    return;
  }

  renderizarDetalleModal(consulta);
}

function renderizarConsultas(lista) {
  const tbody = document.getElementById("tablaConsultasBody");
  if (!tbody) return;

  if (lista.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="table__empty">No hay consultas registradas</td></tr>`;
    return;
  }

  tbody.innerHTML = lista
    .map((c) => {
      const consultaId = normalizarId(c.id);
      const idAttr = escaparHTML(consultaId || "");
      const accionesDisabled = consultaId ? "" : " disabled";

      return `
        <tr class="consulta-row" data-id="${idAttr}" tabindex="0" aria-label="Abrir detalle de consulta de ${escaparHTML(c.nombre_cliente)}">
            <td>${escaparHTML(formatearFecha(c.fecha_consulta))}</td>
            <td>
                <div class="cliente">
                    <strong>${escaparHTML(c.nombre_cliente)}</strong>
                    <span>${escaparHTML(c.email)}</span>
                </div>
            </td>
            <td>${escaparHTML(c.telefono)}</td>
            <td>${escaparHTML(c.servicio_consultado)}</td>
            <td class="table__msg" title="${escaparHTML(c.mensaje)}">${escaparHTML(resumirTexto(c.mensaje))}</td>
            <td><span class="estado estado-${escaparHTML(obtenerClaseEstado(c.estado))}">${obtenerEstadoLabel(c.estado)}</span></td>
            <td>
                <div class="acciones">
                    <button class="acciones__btn acciones__btn--pendiente" data-id="${idAttr}" data-estado="pendiente" type="button"${accionesDisabled}>Pendiente</button>
                    <button class="acciones__btn acciones__btn--respondida" data-id="${idAttr}" data-estado="respondido" type="button"${accionesDisabled}>Respondido</button>
                    <button class="acciones__btn acciones__btn--eliminar" data-id="${idAttr}" type="button"${accionesDisabled}>Eliminar</button>
                </div>
            </td>
        </tr>
      `;
    })
    .join("");
}

function renderizarError(mensaje) {
  const tbody = document.getElementById("tablaConsultasBody");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="7" class="table__empty">${escaparHTML(mensaje)}</td></tr>`;
}

async function cargarConsultas(opciones = {}) {
  if (!opciones.mantenerFeedback) limpiarFeedback();
  renderizarError("Cargando consultas...");

  try {
    const data = await obtenerConsultasDesdeSupabase();
    consultas = data.map(normalizarConsulta);
    filtrarConsultas();
    actualizarModalAbierto();
  } catch (error) {
    registrarErrorCargaConsultas(error);
    consultas = [];
    actualizarTotal(0);
    renderizarError(obtenerMensajeErrorCarga(error));
    mostrarFeedback(obtenerMensajeErrorCarga(error), "error");
  }
}

function filtrarConsultas() {
  const filtroEstado = document.getElementById("filtroEstado")?.value || "todas";
  const buscador = (document.getElementById("buscadorConsultas")?.value || "").toLowerCase().trim();

  let filtradas = [...consultas];

  if (filtroEstado !== "todas") {
    filtradas = filtradas.filter((c) => c.estado === filtroEstado);
  }

  if (buscador) {
    filtradas = filtradas.filter(
      (c) =>
        (c.nombre_cliente || "").toLowerCase().includes(buscador) ||
        (c.telefono || "").toLowerCase().includes(buscador) ||
        (c.email || "").toLowerCase().includes(buscador) ||
        (c.servicio_consultado || "").toLowerCase().includes(buscador) ||
        (c.estado || "").toLowerCase().includes(buscador) ||
        (c.mensaje || "").toLowerCase().includes(buscador)
    );
  }

  renderizarConsultas(filtradas);
  actualizarTotal(filtradas.length);
}

async function cambiarEstado(id, nuevoEstado) {
  const consultaId = normalizarId(id);

  if (!consultaId) {
    console.error("[Consultas admin] No se pudo actualizar estado: id inválido", { id, nuevoEstado });
    mostrarFeedback("No se pudo actualizar la consulta porque falta el ID.", "error");
    return false;
  }

  try {
    const supabaseClient = obtenerSupabaseClient();
    const { error, count } = await supabaseClient
      .from("consultas")
      .update({ estado: normalizarEstado(nuevoEstado) }, { count: "exact" })
      .eq("id", consultaId);

    if (error) throw error;
    if (count === 0) throw new Error("Supabase no actualizó ninguna fila. Revisá que el id exista y que RLS permita UPDATE.");

    await cargarConsultas({ mantenerFeedback: true });
    mostrarFeedback("Estado actualizado correctamente.", "success");
    return true;
  } catch (error) {
    console.error("[Consultas admin] Error al actualizar estado de consulta", {
      id: consultaId,
      nuevoEstado,
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
      code: error?.code,
      error
    });
    mostrarFeedback(obtenerMensajeErrorAccion(error, "actualizar el estado", "UPDATE"), "error");
    return false;
  }
}

async function eliminarConsulta(id) {
  const consultaId = normalizarId(id);

  if (!consultaId) {
    console.error("[Consultas admin] No se pudo eliminar consulta: id inválido", { id });
    mostrarFeedback("No se pudo eliminar la consulta porque falta el ID.", "error");
    return false;
  }

  const consulta = obtenerConsultaPorId(consultaId);
  const nombre = consulta?.nombre_cliente || `ID ${consultaId}`;
  const confirmado = confirm(`¿Eliminar la consulta de ${nombre}? Esta acción no se puede deshacer.`);

  if (!confirmado) return false;

  try {
    const supabaseClient = obtenerSupabaseClient();
    const { error, count } = await supabaseClient
      .from("consultas")
      .delete({ count: "exact" })
      .eq("id", consultaId);

    if (error) throw error;
    if (count === 0) throw new Error("Supabase no eliminó ninguna fila. Revisá que el id exista y que RLS permita DELETE.");

    cerrarModalConsulta();

    await cargarConsultas({ mantenerFeedback: true });
    mostrarFeedback("Consulta eliminada correctamente.", "success");
    return true;
  } catch (error) {
    console.error("[Consultas admin] Error al eliminar consulta", {
      id: consultaId,
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
      code: error?.code,
      error
    });
    mostrarFeedback(obtenerMensajeErrorAccion(error, "eliminar la consulta", "DELETE"), "error");
    return false;
  }
}

function actualizarTotal(cantidad) {
  const totalEl = document.getElementById("totalConsultas");
  if (totalEl) totalEl.textContent = cantidad;
}

function inicializarModal() {
  const modal = document.getElementById("consultaModal");

  modal?.addEventListener("click", (e) => {
    if (e.target.closest("[data-modal-close]")) {
      cerrarModalConsulta();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") cerrarModalConsulta();
  });

  document.getElementById("consultaModalEliminar")?.addEventListener("click", () => {
    eliminarConsulta(consultaSeleccionadaId);
  });

  document.getElementById("consultaModalResponder")?.addEventListener("click", () => {
    cambiarEstado(consultaSeleccionadaId, "respondido");
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  if (typeof window.ensureAdminSession === "function") {
    const autorizado = await window.ensureAdminSession();
    if (!autorizado) return;
  }

  inicializarModal();
  cargarConsultas();

  document.getElementById("filtroEstado")?.addEventListener("change", filtrarConsultas);
  document.getElementById("buscadorConsultas")?.addEventListener("input", filtrarConsultas);

  document.getElementById("tablaConsultasBody")?.addEventListener("click", (e) => {
    const botonEstado = e.target.closest(".acciones__btn[data-estado]");
    const botonEliminar = e.target.closest(".acciones__btn--eliminar");
    const fila = e.target.closest(".consulta-row[data-id]");

    if (botonEstado) {
      cambiarEstado(botonEstado.dataset.id, botonEstado.dataset.estado);
      return;
    }

    if (botonEliminar) {
      eliminarConsulta(botonEliminar.dataset.id);
      return;
    }

    if (fila) abrirModalConsulta(fila.dataset.id);
  });

  document.getElementById("tablaConsultasBody")?.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    if (e.target.closest(".acciones")) return;

    const fila = e.target.closest(".consulta-row[data-id]");
    if (!fila) return;

    e.preventDefault();
    abrirModalConsulta(fila.dataset.id);
  });
});
