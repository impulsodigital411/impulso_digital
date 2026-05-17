// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import bcrypt from "https://esm.sh/bcryptjs@2.4.3";

const ALLOWED_ROLES = new Set(["admin", "editor"]);
const SESSION_TTL_SECONDS = 60 * 60 * 8;
const encoder = new TextEncoder();
const decoder = new TextDecoder();

function getCorsHeaders(request: Request) {
    const origin = request.headers.get("origin") || "*";
    const configuredOrigins = (Deno.env.get("ALLOWED_ORIGINS") || "*")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
    const allowOrigin = configuredOrigins.includes("*") || configuredOrigins.includes(origin)
        ? origin
        : configuredOrigins[0] || "*";

    return {
        "Access-Control-Allow-Origin": allowOrigin === "*" ? "*" : allowOrigin,
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Vary": "Origin"
    };
}

function jsonResponse(request: Request, body: Record<string, unknown>, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            ...getCorsHeaders(request),
            "Content-Type": "application/json"
        }
    });
}

function genericAuthError(request: Request) {
    return jsonResponse(request, { ok: false, message: "Credenciales inválidas." }, 401);
}

function getAdminClient() {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error("Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.");
    }

    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false
        }
    });
}

function getSessionSecret() {
    const secret = Deno.env.get("ADMIN_SESSION_SECRET");

    if (!secret || secret.length < 32) {
        throw new Error("ADMIN_SESSION_SECRET debe existir y tener al menos 32 caracteres.");
    }

    return secret;
}

function base64UrlEncode(value: string | Uint8Array) {
    const bytes = typeof value === "string" ? encoder.encode(value) : value;
    let binary = "";

    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }

    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value: string) {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
    }

    return bytes;
}

async function signValue(value: string) {
    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(getSessionSecret()),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );
    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));

    return base64UrlEncode(new Uint8Array(signature));
}

function timingSafeEqual(left: string, right: string) {
    const leftBytes = base64UrlDecode(left);
    const rightBytes = base64UrlDecode(right);

    if (leftBytes.length !== rightBytes.length) return false;

    let result = 0;
    for (let index = 0; index < leftBytes.length; index += 1) {
        result |= leftBytes[index] ^ rightBytes[index];
    }

    return result === 0;
}

async function createSessionToken(admin: any) {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
        sub: String(admin.id),
        usuario: admin.usuario,
        rol: admin.rol,
        iat: now,
        exp: now + SESSION_TTL_SECONDS
    };
    const header = { alg: "HS256", typ: "JWT" };
    const unsigned = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(payload))}`;
    const signature = await signValue(unsigned);

    return {
        token: `${unsigned}.${signature}`,
        expires_at: new Date(payload.exp * 1000).toISOString()
    };
}

async function verifySessionToken(token: string) {
    const parts = token.split(".");
    if (parts.length !== 3) throw new Error("Token inválido.");

    const [header, payload, signature] = parts;
    const expectedSignature = await signValue(`${header}.${payload}`);

    if (!timingSafeEqual(signature, expectedSignature)) {
        throw new Error("Firma inválida.");
    }

    const decodedPayload = JSON.parse(decoder.decode(base64UrlDecode(payload)));
    const now = Math.floor(Date.now() / 1000);

    if (!decodedPayload.exp || decodedPayload.exp <= now) {
        throw new Error("Token vencido.");
    }

    return decodedPayload;
}

function sanitizeAdmin(admin: any) {
    return {
        id: admin.id,
        usuario: admin.usuario,
        nombre: admin.nombre,
        rol: admin.rol
    };
}

async function handleLogin(request: Request, body: any) {
    const usuario = String(body.usuario || "").trim();
    const password = String(body.password || "");

    if (!usuario || !password) {
        return genericAuthError(request);
    }

    const supabase = getAdminClient();
    const { data: admin, error } = await supabase
        .from("usuarios_admin")
        .select("id, usuario, password_hash, nombre, rol, estado")
        .eq("usuario", usuario)
        .maybeSingle();

    if (error || !admin || admin.estado !== "activo" || !ALLOWED_ROLES.has(admin.rol)) {
        return genericAuthError(request);
    }

    let passwordOk = false;
    try {
        passwordOk = bcrypt.compareSync(password, admin.password_hash);
    } catch (_error) {
        passwordOk = false;
    }

    if (!passwordOk) {
        return genericAuthError(request);
    }

    const session = await createSessionToken(admin);

    return jsonResponse(request, {
        ok: true,
        token: session.token,
        expires_at: session.expires_at,
        admin: sanitizeAdmin(admin)
    });
}

async function handleVerify(request: Request, body: any) {
    const token = String(body.token || "").trim();
    if (!token) return genericAuthError(request);

    let payload;
    try {
        payload = await verifySessionToken(token);
    } catch (_error) {
        return genericAuthError(request);
    }

    const supabase = getAdminClient();
    const { data: admin, error } = await supabase
        .from("usuarios_admin")
        .select("id, usuario, nombre, rol, estado")
        .eq("id", payload.sub)
        .maybeSingle();

    if (error || !admin || admin.estado !== "activo" || !ALLOWED_ROLES.has(admin.rol)) {
        return genericAuthError(request);
    }

    return jsonResponse(request, {
        ok: true,
        expires_at: new Date(payload.exp * 1000).toISOString(),
        admin: sanitizeAdmin(admin)
    });
}

serve(async (request) => {
    if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: getCorsHeaders(request) });
    }

    if (request.method !== "POST") {
        return jsonResponse(request, { ok: false, message: "Método no permitido." }, 405);
    }

    try {
        const body = await request.json();
        const action = String(body.action || "login");

        if (action === "verify") {
            return await handleVerify(request, body);
        }

        return await handleLogin(request, body);
    } catch (error) {
        console.error(error);
        return jsonResponse(request, { ok: false, message: "No se pudo completar la operación." }, 500);
    }
});
