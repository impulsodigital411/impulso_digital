document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger');
    const nav = document.getElementById('nav');
    const header = document.getElementById('header');
    const form = document.getElementById('contactForm');
    const telefonoInput = document.getElementById('telefono');
    const formStatus = document.getElementById('contactFormStatus');
    const whatsappWidget = document.getElementById('whatsappWidget');
    const whatsappButton = document.getElementById('whatsappButton');
    const whatsappPanel = document.getElementById('whatsappPanel');
    const destinoWhatsapp = document.getElementById('destinoWhatsapp');
    const lightbox = document.getElementById('projectLightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxTitle = document.getElementById('lightboxTitle');
    const lightboxClose = document.querySelector('.lightbox__close');

    const whatsappPrincipal = '542646313348';

    function cerrarMenu() {
        hamburger?.classList.remove('active');
        nav?.classList.remove('active');
        hamburger?.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('no-scroll');
    }

    hamburger?.addEventListener('click', () => {
        const isOpen = hamburger.classList.toggle('active');
        nav?.classList.toggle('active', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
        document.body.classList.toggle('no-scroll', isOpen);
    });

    document.querySelectorAll('.nav__link').forEach(link => {
        link.addEventListener('click', cerrarMenu);
    });

    document.addEventListener('click', (event) => {
        if (!nav || !hamburger) return;
        const clickOutsideMenu = !nav.contains(event.target) && !hamburger.contains(event.target);
        if (nav.classList.contains('active') && clickOutsideMenu) cerrarMenu();
    });

    window.addEventListener('scroll', () => {
        header?.classList.toggle('header--scrolled', window.scrollY > 20);
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (event) => {
            const href = anchor.getAttribute('href');
            if (!href || href === '#') return;
            const target = document.querySelector(href);
            if (!target) return;
            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    const fadeElements = document.querySelectorAll('.fade-in');
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        fadeElements.forEach(element => observer.observe(element));
    } else {
        fadeElements.forEach(element => element.classList.add('visible'));
    }

    telefonoInput?.addEventListener('input', () => {
        telefonoInput.value = telefonoInput.value.replace(/\D/g, '').slice(0, 15);
    });

    function mostrarEstado(mensaje, tipo) {
        if (!formStatus) return;
        formStatus.textContent = mensaje;
        formStatus.className = 'form__status';
        if (tipo) formStatus.classList.add(`form__status--${tipo}`);
    }

    function crearMensajeWhatsApp({ nombre, email, telefono, servicio, mensaje }) {
        const lineas = [
            'Hola, quiero consultar por Impulso.',
            '',
            `Nombre: ${nombre}`,
            email ? `Email: ${email}` : '',
            telefono ? `Teléfono: ${telefono}` : '',
            servicio ? `Servicio de interés: ${servicio}` : '',
            '',
            `Mensaje: ${mensaje}`
        ].filter(Boolean);

        return encodeURIComponent(lineas.join('\n'));
    }

    form?.addEventListener('submit', (event) => {
        event.preventDefault();

        const nombre = document.getElementById('nombre')?.value.trim() || '';
        const email = document.getElementById('email')?.value.trim() || '';
        const telefono = telefonoInput?.value.trim() || '';
        const servicio = document.getElementById('servicio')?.value.trim() || '';
        const mensaje = document.getElementById('mensaje')?.value.trim() || '';
        const numeroDestino = destinoWhatsapp?.value || whatsappPrincipal;
        const emailValido = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        const telefonoValido = !telefono || /^[0-9]{8,15}$/.test(telefono);

        if (!nombre || !mensaje) {
            mostrarEstado('Completá tu nombre y el mensaje para poder enviarlo.', 'error');
            return;
        }

        if (!email && !telefono) {
            mostrarEstado('Dejá un email o teléfono para poder responderte.', 'error');
            return;
        }

        if (!emailValido) {
            mostrarEstado('Revisá el formato del correo electrónico.', 'error');
            return;
        }

        if (!telefonoValido) {
            mostrarEstado('El teléfono debe tener entre 8 y 15 números.', 'error');
            telefonoInput?.focus();
            return;
        }

        const texto = crearMensajeWhatsApp({ nombre, email, telefono, servicio, mensaje });
        window.open(`https://wa.me/${numeroDestino}?text=${texto}`, '_blank', 'noopener,noreferrer');
        mostrarEstado('Se abrió WhatsApp con tu consulta lista para enviar.', 'success');
        form.reset();
    });

    function setWhatsappOpen(isOpen) {
        whatsappWidget?.classList.toggle('is-open', isOpen);
        whatsappButton?.setAttribute('aria-expanded', String(isOpen));
        whatsappPanel?.setAttribute('aria-hidden', String(!isOpen));
    }

    whatsappButton?.addEventListener('click', () => {
        setWhatsappOpen(!whatsappWidget?.classList.contains('is-open'));
    });

    document.addEventListener('click', (event) => {
        if (!whatsappWidget || whatsappWidget.contains(event.target)) return;
        setWhatsappOpen(false);
    });

    document.querySelectorAll('[data-project-row]').forEach(row => {
        const slider = row.querySelector('.project-slider');
        const prev = row.querySelector('.gallery-btn--prev');
        const next = row.querySelector('.gallery-btn--next');
        if (!slider) return;

        const mover = (direccion) => {
            const distancia = Math.max(280, Math.floor(slider.clientWidth * 0.75));
            slider.scrollBy({ left: direccion * distancia, behavior: 'smooth' });
        };

        prev?.addEventListener('click', () => mover(-1));
        next?.addEventListener('click', () => mover(1));
    });

    document.querySelectorAll('.project-consult').forEach(link => {
        link.addEventListener('click', () => {
            const proyecto = link.dataset.project || 'un proyecto digital';
            const servicio = document.getElementById('servicio');
            const mensaje = document.getElementById('mensaje');
            if (servicio) servicio.value = proyecto.includes('stock') ? 'Sistema de stock e inventario' : 'Sistema web a medida';
            if (mensaje && !mensaje.value.trim()) {
                mensaje.value = `Hola, me interesa consultar por ${proyecto}. Quisiera saber cómo se podría adaptar a mi negocio.`;
            }
        });
    });

    function abrirLightbox(src, title) {
        if (!lightbox || !lightboxImage || !lightboxTitle) return;
        lightboxImage.src = src;
        lightboxImage.alt = title || 'Vista ampliada del proyecto';
        lightboxTitle.textContent = title || '';
        lightbox.classList.add('is-open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.classList.add('no-scroll');
    }

    function cerrarLightbox() {
        if (!lightbox || !lightboxImage) return;
        lightbox.classList.remove('is-open');
        lightbox.setAttribute('aria-hidden', 'true');
        lightboxImage.src = '';
        document.body.classList.remove('no-scroll');
    }

    document.querySelectorAll('[data-lightbox]').forEach(button => {
        button.addEventListener('click', () => {
            abrirLightbox(button.dataset.lightbox, button.dataset.title);
        });
    });

    lightboxClose?.addEventListener('click', cerrarLightbox);
    lightbox?.addEventListener('click', (event) => {
        if (event.target === lightbox) cerrarLightbox();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            cerrarMenu();
            setWhatsappOpen(false);
            cerrarLightbox();
        }
    });
});
