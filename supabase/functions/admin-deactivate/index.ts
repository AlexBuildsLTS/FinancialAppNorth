import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.56.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req: Request) => {
  try {
    const authHeader = req.headers.get('authorization') ?? '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return new Response(JSON.stringify({ error: 'Missing Authorization Bearer token' }), { status: 401, headers: { 'Content-Type': 'application/json' } });

    const userResp = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { Authorization: `Bearer ${token}` } });
    if (!userResp.ok) return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    const userJson = await userResp.json();
    const callerId = userJson?.id;
    if (!callerId) return new Response(JSON.stringify({ error: 'Unable to resolve user from token' }), { status: 401, headers: { 'Content-Type': 'application/json' } });

    const { data: callerProfile, error: pErr } = await supabaseAdmin.from('profiles').select('role').eq('id', callerId).single();
    if (pErr) throw pErr;
    if (callerProfile?.role !== 'admin') return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } });

    const body = await req.json();
    const { userId } = body ?? {};
    if (!userId) return new Response(JSON.stringify({ error: 'userId required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

    // try revoke tokens (may not be available in some runtimes)
    try {
      const adminAuth: any = (supabaseAdmin.auth as any)?.admin;
      if (adminAuth?.revokeRefreshTokens) {
        const { error: revokeErr } = await adminAuth.revokeRefreshTokens(userId);
        if (revokeErr) throw revokeErr;
      }
    } catch (e) {
      console.warn('revokeRefreshTokens unavailable or failed', e);
    }

    const { error } = await supabaseAdmin.from('profiles').update({ is_admin: false }).eq('id', userId);
    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'unknown' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});
