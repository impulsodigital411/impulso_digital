(function () {
    const SESSION_KEY = "impulso_admin_dev_session";
    const DEV_SESSION_TTL_MS = 8 * 60 * 60 * 1000;
    const GENERIC_ERROR = "Credenciales inválidas.";

    function getLoginPath() {
        return window.location.pathname.includes("/admin/") ? "login.html" : "admin/login.html";
    }

    function getDashboardPath() {
        return window.location.pathname.includes("/admin/") ? "dashboard.html" : "admin/dashboard.html";
    }

    function readSession() {
        try {
            const raw = sessionStorage.getItem(SESSION_KEY);
            if (!raw) return null;

            const session = JSON.parse(raw);
            const expiresAt = new Date(session.expires_at || session.expiresAt).getTime();

            if (!session.dev || !session.usuario || !session.nombre || !session.rol || Number.isNaN(expiresAt) || expiresAt <= Date.now()) {
                clearSession();
                return null;
            }

            return session;
        } catch (_error) {
            clearSession();
            return null;
        }
    }

    function saveSession(data) {
        const session = {
            dev: true,
            usuario: data.usuario,
            nombre: data.nombre,
            rol: data.rol,
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + DEV_SESSION_TTL_MS).toISOString()
        };

        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
        return session;
    }

    function clearSession() {
        sessionStorage.removeItem(SESSION_KEY);
    }

    function getSupabaseClient() {
        if (typeof db !== "undefined" && typeof db.rpc === "function") {
            return db;
        }

        if (typeof supabase !== "undefined" && typeof supabase.rpc === "function") {
            return supabase;
        }

        throw new Error("La conexión con Supabase RPC no está disponible.");
    }

    function normalizeLoginData(data) {
        return Array.isArray(data) ? data[0] : data;
    }

    async function login(usuario, password) {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.rpc("validar_login_admin", {
            p_usuario: usuario,
            p_password: password
        });

        const result = normalizeLoginData(data);

        if (error || !result?.ok) {
            throw error || new Error("Credenciales inválidas.");
        }

        return saveSession({
            usuario: result.usuario || usuario,
            nombre: result.nombre || result.usuario || usuario,
            rol: result.rol || "admin"
        });
    }

    async function verifySession() {
        return readSession();
    }

    function logout() {
        clearSession();
        window.location.href = getLoginPath();
    }

    function setLoginMessage(message, type) {
        const messageEl = document.getElementById("loginMessage");
        if (!messageEl) return;

        messageEl.textContent = message;
        messageEl.className = "login-message";

        if (type) {
            messageEl.classList.add(`login-message--${type}`);
        }
    }

    async function initLoginForm() {
        const form = document.getElementById("loginForm");
        if (!form) return;

        const existingSession = readSession();
        if (existingSession) {
            try {
                await verifySession();
                window.location.href = getDashboardPath();
                return;
            } catch (_error) {
                clearSession();
            }
        }

        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            const usuario = document.getElementById("usuario")?.value.trim() || "";
            const password = document.getElementById("password")?.value || "";
            const submit = document.getElementById("loginSubmit");

            if (!usuario || !password) {
                setLoginMessage("Completá usuario y contraseña.", "error");
                return;
            }

            submit.disabled = true;
            submit.textContent = "Validando...";
            setLoginMessage("", "");

            try {
                await login(usuario, password);
                window.location.href = getDashboardPath();
            } catch (error) {
                console.error(error);
                clearSession();
                setLoginMessage(GENERIC_ERROR, "error");
                submit.disabled = false;
                submit.textContent = "Iniciar sesión";
            }
        });
    }

    function initLogoutButtons() {
        document.getElementById("btnCerrarSesion")?.addEventListener("click", logout);
    }

    window.AdminAuth = {
        SESSION_KEY,
        clearSession,
        getDashboardPath,
        getLoginPath,
        login,
        logout,
        readSession,
        verifySession
    };

    document.addEventListener("DOMContentLoaded", () => {
        initLoginForm();
        initLogoutButtons();
    });
})();
