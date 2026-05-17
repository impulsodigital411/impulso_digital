(function () {
    let verificationPromise = null;

    function redirectToLogin() {
        window.AdminAuth?.clearSession?.();
        window.location.href = "login.html";
    }

    function isValidDevSession(session) {
        return Boolean(session?.dev && session.usuario && session.nombre && session.rol);
    }

    async function ensureAdminSession() {
        if (verificationPromise) return verificationPromise;

        verificationPromise = (async () => {
            try {
                if (!window.AdminAuth) {
                    throw new Error("No se pudo cargar el módulo de autenticación.");
                }

                const session = window.AdminAuth.readSession();
                if (!isValidDevSession(session)) {
                    throw new Error("Sesión temporal inexistente o vencida.");
                }

                document.body.classList.add("admin-ready");
                return true;
            } catch (error) {
                console.error(error);
                redirectToLogin();
                return false;
            }
        })();

        return verificationPromise;
    }

    window.ensureAdminSession = ensureAdminSession;

    document.addEventListener("DOMContentLoaded", ensureAdminSession);
})();
