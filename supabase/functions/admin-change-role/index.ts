import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.56.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req: Request) => {
  try {
    // 1) verify Authorization header and map to a Supabase user
    const authHeader = req.headers.get('authorization') ?? '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return new Response(JSON.stringify({ error: 'Missing Authorization Bearer token' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    // call Supabase auth endpoint to get user
    const userResp = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!userResp.ok) {
      const txt = await userResp.text();
      return new Response(JSON.stringify({ error: 'Invalid token', detail: txt }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    const userJson = await userResp.json();
    const callerId = userJson?.id;
    if (!callerId) return new Response(JSON.stringify({ error: 'Unable to resolve user from token' }), { status: 401, headers: { 'Content-Type': 'application/json' } });

    // 2) check caller is admin
    const { data: callerProfile, error: pErr } = await supabaseAdmin.from('profiles').select('role').eq('id', callerId).single();
    if (pErr) throw pErr;
    if (callerProfile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    // 3) proceed with role change
    const body = await req.json();
    const { userId, newRole } = body ?? {};
    if (!userId || !newRole) {
      return new Response(JSON.stringify({ error: 'userId and newRole required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const { error } = await supabaseAdmin.from('profiles').update({ role: newRole, is_admin: newRole === 'admin' }).eq('id', userId);
    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'unknown' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});
