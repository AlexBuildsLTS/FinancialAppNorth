import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qnrxncngoqphnerdrnnc.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

function serve(arg0: (req: Request) => Promise<Response>) {    
  throw new Error("Function not implemented.");  
}

const SUPABASE_URL = process.env.SUPABASE_URL ?? ''  
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
)

serve(async (req: Request) => {    
  try {      
    const authHeader = req.headers.get('authorization') ?? '';    
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;  
    if (!token) {   
      return new Response(JSON.stringify({ error: 'Missing Authorization Bearer token' }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      });    
    }     
    const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {       
      headers: { Authorization: `Bearer ${token}` }     
    });     
    if (!userResponse.ok) {      
      const txt = await userResponse.text();  
      return new Response(JSON.stringify({ error: 'Invalid token', detail: txt }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      });    
    }     
    const userJson = await userResponse.json();     
    const callerId = userJson?.id;    
    if (!callerId) {      
      return new Response(JSON.stringify({ error: 'Unable to resolve user from token' }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      });    
    }     
    const { data: callerProfile, error: pErr } = await supabaseAdmin.from('profiles').select('role').eq('id', callerId).single();    
    if (pErr) throw pErr;    
    if (callerProfile?.role !== 'admin') {      
      return new Response(JSON.stringify({ error: 'forbidden' }), { 
        status: 403, 
        headers: { 'Content-Type': 'application/json' } 
      });    
    }     
    const body = await req.json();     
    const { userId, newRole } = body ?? {};     
    if (!userId || !newRole) {      
      return new Response(JSON.stringify({ error: 'userId and newRole required' }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });    
    }     
    const { error } = await supabaseAdmin.from('profiles').update({ role: newRole }).eq('id', userId);    
    if (error) throw error;     
    return new Response(JSON.stringify({ success: true }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });  
  } catch (e) {    
    console.error(e);    
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'unknown' }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });  
  }    
});