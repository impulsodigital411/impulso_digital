document.addEventListener('DOMContentLoaded', () => {
    const WHATSAPP_PRINCIPAL = '542646313348';
    const WHATSAPP_SECUNDARIO = '542646224495';
    const MENSAJE_GENERAL = 'Hola Impulso, vi su página web y quiero recibir información sobre sus servicios. ¿Me pueden asesorar?';

    const hamburger = document.getElementById('hamburger');
    const nav = document.getElementById('nav');
    const header = document.getElementById('header');

    hamburger?.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        nav?.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    });

    document.querySelectorAll('.nav__link').forEach((link) => {
        link.addEventListener('click', () => cerrarMenu());
    });

    document.addEventListener('click', (event) => {
        if (!nav || !hamburger) return;
        if (!nav.contains(event.target) && !hamburger.contains(event.target)) cerrarMenu();
    });

    function cerrarMenu() {
        hamburger?.classList.remove('active');
        nav?.classList.remove('active');
        document.body.classList.remove('menu-open');
    }

    window.addEventListener('scroll', () => {
        header?.classList.toggle('header--scrolled', window.scrollY > 30);
    });

    const fadeElements = document.querySelectorAll('.fade-in');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

    fadeElements.forEach((el) => observer.observe(el));

    document.querySelectorAll('.whatsapp-link').forEach((link) => {
        const numero = link.dataset.numero || WHATSAPP_PRINCIPAL;
        const mensaje = link.dataset.message || MENSAJE_GENERAL;
        link.href = crearWhatsAppUrl(numero, mensaje);
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
    });

    document.querySelectorAll('.whatsapp-service').forEach((link) => {
        const servicio = link.dataset.servicio || 'una solución digital';
        const mensaje = `Hola Impulso, vi la interfaz de ${servicio} y quiero más información. ¿Me pueden orientar y pasar una cotización?`;
        link.href = crearWhatsAppUrl(WHATSAPP_PRINCIPAL, mensaje);
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
    });

    const telefonoInput = document.getElementById('telefono');
    telefonoInput?.addEventListener('input', () => {
        telefonoInput.value = telefonoInput.value.replace(/\D/g, '').slice(0, 15);
    });

    const form = document.getElementById('contactForm');
    const submit = document.getElementById('contactSubmit');

    form?.addEventListener('submit', async (event) => {
        event.preventDefault();

        const nombre = valor('nombre');
        const telefono = valor('telefono');
        const email = valor('email');
        const servicio = valor('servicio');
        const mensaje = valor('mensaje');

        if (!nombre || !telefono || !servicio || !mensaje) {
            mostrarEstado('Completá nombre, teléfono, servicio y mensaje.', 'error');
            return;
        }

        if (!/^[0-9]{8,15}$/.test(telefono)) {
            mostrarEstado('El teléfono debe tener entre 8 y 15 números.', 'error');
            telefonoInput?.focus();
            return;
        }

        const textoWhatsApp = [
            'Hola Impulso, quiero hacer una consulta.',
            `Nombre: ${nombre}`,
            `Teléfono: ${telefono}`,
            email ? `Correo: ${email}` : '',
            `Servicio: ${servicio}`,
            `Mensaje: ${mensaje}`
        ].filter(Boolean).join('\n');

        submit.disabled = true;
        submit.innerHTML = '<span class="btn__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.52 3.48A11.86 11.86 0 0 0 12.07 0C5.53 0 .22 5.31.22 11.84c0 2.09.55 4.14 1.58 5.94L0 24l6.41-1.68a11.82 11.82 0 0 0 5.66 1.44h.01c6.53 0 11.84-5.31 11.84-11.84 0-3.16-1.23-6.13-3.4-8.44ZM12.08 21.76h-.01a9.82 9.82 0 0 1-5-1.37l-.36-.21-3.8 1 .99-3.7-.24-.38a9.83 9.83 0 0 1-1.5-5.26c0-5.43 4.42-9.85 9.86-9.85 2.63 0 5.11 1.02 6.97 2.88a9.79 9.79 0 0 1 2.88 6.97c0 5.43-4.42 9.85-9.85 9.85Zm5.4-7.39c-.3-.15-1.77-.87-2.05-.96-.27-.1-.47-.15-.67.15s-.76.96-.93 1.16c-.17.2-.35.23-.65.08-.3-.15-1.26-.46-2.4-1.46-.89-.79-1.5-1.77-1.67-2.07-.18-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.38-.02-.52-.08-.15-.67-1.62-.92-2.23-.24-.57-.48-.49-.67-.5h-.57c-.2 0-.52.08-.79.38-.27.3-1.03 1-1.03 2.43s1.05 2.81 1.2 3.01c.15.2 2.07 3.17 5.02 4.45.7.3 1.25.49 1.67.62.7.22 1.34.18 1.85.11.56-.08 1.77-.72 2.02-1.42.25-.69.25-1.29.17-1.42-.07-.12-.27-.2-.57-.35Z"/></svg></span><span>Preparando...</span>';
        submit.setAttribute('aria-busy', 'true');
        mostrarEstado('Estamos preparando tu mensaje de WhatsApp.', 'success');

        await guardarConsultaSiEsPosible({
            nombre_cliente: nombre,
            telefono,
            email: email || null,
            servicio_consultado: servicio,
            mensaje,
            estado: 'pendiente'
        });

        window.open(crearWhatsAppUrl(WHATSAPP_PRINCIPAL, textoWhatsApp), '_blank', 'noopener,noreferrer');

        setTimeout(() => {
            form.reset();
            submit.disabled = false;
            submit.innerHTML = '<span class="btn__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.52 3.48A11.86 11.86 0 0 0 12.07 0C5.53 0 .22 5.31.22 11.84c0 2.09.55 4.14 1.58 5.94L0 24l6.41-1.68a11.82 11.82 0 0 0 5.66 1.44h.01c6.53 0 11.84-5.31 11.84-11.84 0-3.16-1.23-6.13-3.4-8.44ZM12.08 21.76h-.01a9.82 9.82 0 0 1-5-1.37l-.36-.21-3.8 1 .99-3.7-.24-.38a9.83 9.83 0 0 1-1.5-5.26c0-5.43 4.42-9.85 9.86-9.85 2.63 0 5.11 1.02 6.97 2.88a9.79 9.79 0 0 1 2.88 6.97c0 5.43-4.42 9.85-9.85 9.85Zm5.4-7.39c-.3-.15-1.77-.87-2.05-.96-.27-.1-.47-.15-.67.15s-.76.96-.93 1.16c-.17.2-.35.23-.65.08-.3-.15-1.26-.46-2.4-1.46-.89-.79-1.5-1.77-1.67-2.07-.18-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.38-.02-.52-.08-.15-.67-1.62-.92-2.23-.24-.57-.48-.49-.67-.5h-.57c-.2 0-.52.08-.79.38-.27.3-1.03 1-1.03 2.43s1.05 2.81 1.2 3.01c.15.2 2.07 3.17 5.02 4.45.7.3 1.25.49 1.67.62.7.22 1.34.18 1.85.11.56-.08 1.77-.72 2.02-1.42.25-.69.25-1.29.17-1.42-.07-.12-.27-.2-.57-.35Z"/></svg></span><span>Enviar consulta</span>';
            submit.removeAttribute('aria-busy');
            mostrarEstado('Listo. Si WhatsApp no se abrió, revisá que el navegador no haya bloqueado la ventana.', 'success');
        }, 900);
    });

    async function guardarConsultaSiEsPosible(consulta) {
        try {
            if (typeof window.db === 'undefined' || typeof window.db.from !== 'function') return;
            const { error } = await window.db.from('consultas').insert([consulta]);
            if (error) console.warn('[Impulso] No se pudo guardar la consulta en Supabase:', error.message);
        } catch (error) {
            console.warn('[Impulso] Error guardando consulta:', error);
        }
    }

    function crearWhatsAppUrl(numero, mensaje) {
        return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
    }

    function valor(id) {
        return document.getElementById(id)?.value.trim() || '';
    }

    function mostrarEstado(mensaje, tipo) {
        const estado = document.getElementById('contactFormStatus');
        if (!estado) return;
        estado.textContent = mensaje;
        estado.className = 'form-status';
        if (tipo) estado.classList.add(`form-status--${tipo}`);
    }

    window.IMPULSO_CONTACTO = {
        whatsappPrincipal: WHATSAPP_PRINCIPAL,
        whatsappSecundario: WHATSAPP_SECUNDARIO
    };
});
