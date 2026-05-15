document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // MENÚ HAMBURGUESA
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
    // CONTADOR DE ESTADÍSTICAS
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
    // FORMULARIO
    // ==========================================
    const form = document.getElementById('contactForm');

    form?.addEventListener('submit', (e) => {
        e.preventDefault();

        const nombre = document.getElementById('nombre').value.trim();
        const email = document.getElementById('email').value.trim();
        const telefono = document.getElementById('telefono').value.trim();
        const mensaje = document.getElementById('mensaje').value.trim();
        const btn = form.querySelector('.form__btn');

        if (!nombre || !mensaje) {
            btn.textContent = 'Completá los campos requeridos';
            btn.style.background = '#dc2626';
            btn.style.borderColor = '#dc2626';

            setTimeout(() => {
                btn.textContent = 'Enviar consulta';
                btn.style.background = '';
                btn.style.borderColor = '';
            }, 2500);

            return;
        }

        btn.textContent = 'Enviando...';
        btn.disabled = true;

        setTimeout(() => {
            guardarConsultaTemporal({ nombre, email, telefono, mensaje });

            btn.textContent = '¡Mensaje enviado!';
            btn.style.background = '#10B981';
            btn.style.borderColor = '#10B981';

            form.reset();

            setTimeout(() => {
                btn.textContent = 'Enviar consulta';
                btn.style.background = '';
                btn.style.borderColor = '';
                btn.disabled = false;
            }, 3000);
        }, 1200);
    });

    function guardarConsultaTemporal({ nombre, email, telefono, mensaje }) {
        const storageKey = 'impulso_consultas_demo';
        const guardadas = localStorage.getItem(storageKey);
        let consultas = [];

        try {
            consultas = guardadas ? JSON.parse(guardadas) : [];
            if (!Array.isArray(consultas)) consultas = [];
        } catch (error) {
            consultas = [];
        }

        const nuevaConsulta = {
            id: Date.now(),
            fecha: new Date().toISOString().slice(0, 10),
            nombre,
            telefono: telefono || 'Sin telefono',
            email: email || 'Sin email',
            servicio: 'Consulta desde formulario web',
            mensaje,
            estado: 'pendiente'
        };

        localStorage.setItem(storageKey, JSON.stringify([nuevaConsulta, ...consultas]));
    }

});
