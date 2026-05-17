const SUPABASE_URL = "https://eqqfdzrxpygybchpfotd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_2bop85igE2qL_xKKASeWXw_Krgt_Y4Z";

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
window.db = db;
window.supabaseClient = db;
