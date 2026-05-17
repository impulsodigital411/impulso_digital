document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // MENU HAMBURGUESA
    // ==========================================
    const hamburger = document.getElementById('hamburger');
    const nav = document.getElementById('nav');

    hamburger?.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        nav?.classList.toggle('active');
    });

    document.querySelectorAll('.nav__link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger?.classList.remove('active');
            nav?.classList.remove('active');
        });
    });

    document.addEventListener('click', (e) => {
        if (nav && hamburger && !nav.contains(e.target) && !hamburger.contains(e.target) && nav.classList.contains('active')) {
            hamburger.classList.remove('active');
            nav.classList.remove('active');
        }
    });

    // ==========================================
    // HEADER SCROLL EFFECT
    // ==========================================
    const header = document.getElementById('header');

    window.addEventListener('scroll', () => {
        header?.classList.toggle('header--scrolled', window.scrollY > 50);
    });

    // ==========================================
    // SCROLL SUAVE
    // ==========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ==========================================
    // SCROLL REVEAL - Intersection Observer
    // ==========================================
    const fadeElements = document.querySelectorAll('.fade-in');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    fadeElements.forEach(el => observer.observe(el));

    // ==========================================
    // CONTADOR DE ESTADISTICAS
    // ==========================================
    const statNumbers = document.querySelectorAll('.nosotros__stat-number');

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const max = parseInt(target.dataset.count);
                if (isNaN(max)) return;

                let current = 0;
                const step = Math.ceil(max / 40);
                const interval = setInterval(() => {
                    current += step;
                    if (current >= max) {
                        current = max;
                        clearInterval(interval);
                    }
                    target.textContent = current + '+';
                }, 40);

                counterObserver.unobserve(target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => counterObserver.observe(el));

    // ==========================================
    // FORMULARIO DE CONSULTA
    // ==========================================
    const form = document.getElementById('contactForm');
    const telefonoInput = document.getElementById('telefono');
    const telefonoRegex = /^[0-9]{8,15}$/;

    telefonoInput?.addEventListener('input', () => {
        telefonoInput.value = telefonoInput.value.replace(/\D/g, '').slice(0, 15);
    });

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nombre = document.getElementById('nombre')?.value.trim() || '';
        const email = document.getElementById('email')?.value.trim() || '';
        const telefono = telefonoInput?.value.trim() || '';
        const servicio = document.getElementById('servicio')?.value.trim() || '';
        const mensaje = document.getElementById('mensaje')?.value.trim() || '';
        const btn = form.querySelector('.form__btn');

        if (!nombre || !email || !mensaje) {
            mostrarEstadoFormulario('Completá nombre, email y mensaje antes de enviar.', 'error');
            return;
        }

        if (telefono && !telefonoRegex.test(telefono)) {
            mostrarEstadoFormulario('El teléfono debe tener entre 8 y 15 números.', 'error');
            telefonoInput?.focus();
            return;
        }

        if (typeof db === 'undefined') {
            mostrarEstadoFormulario('No se pudo iniciar la conexión con Supabase.', 'error');
            return;
        }

        btn.textContent = 'Enviando...';
        btn.disabled = true;
        mostrarEstadoFormulario('', '');

        try {
            await insertarConsulta({
                nombre_cliente: nombre,
                telefono: telefono || null,
                email,
                servicio: servicio || null,
                mensaje,
                estado: 'pendiente'
            });

            mostrarEstadoFormulario('Consulta enviada correctamente. Te responderemos a la brevedad.', 'success');
            form.reset();
            btn.textContent = 'Consulta enviada';

            setTimeout(() => {
                btn.textContent = 'Enviar consulta';
                btn.disabled = false;
            }, 2500);
        } catch (error) {
            console.error(error);
            mostrarEstadoFormulario('No se pudo enviar la consulta. Intentá nuevamente en unos minutos.', 'error');
            btn.textContent = 'Enviar consulta';
            btn.disabled = false;
        }
    });

    async function insertarConsulta(consulta) {
        const { error } = await db.from('consultas').insert([consulta]);

        if (!error) return;

        if (String(error.message || '').includes('servicio')) {
            const { servicio, ...consultaSinServicio } = consulta;
            const { error: fallbackError } = await db
                .from('consultas')
                .insert([{ ...consultaSinServicio, servicio_consultado: servicio }]);

            if (!fallbackError) return;
            throw fallbackError;
        }

        throw error;
    }

    function mostrarEstadoFormulario(mensaje, tipo) {
        const estado = document.getElementById('contactFormStatus');
        if (!estado) return;

        estado.textContent = mensaje;
        estado.className = 'form__status';

        if (tipo) {
            estado.classList.add(`form__status--${tipo}`);
        }
    }

});
