const { createClient } = require('@supabase/supabase-js');  
const http = require('http');


const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const SUPABASE_URL = process.env.SUPABASE_URL || "";


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
function serve(arg0: (req: Request) => Promise<Response>) {
  throw new Error("Function not implemented.");
}   
const server = http.createServer(async (
  req: {
    headers: {
      get: (name: string) => string | null | undefined; // Correct return type for Headers.get
      [key: string]: string | string[] | undefined | ((name: string) => string | null | undefined); // Allow other header access
    };
    on(event: 'data', listener: (chunk: string) => void): void; // Correct type for 'data' event listener
    on(event: 'end', listener: () => void): void; // Correct type for 'end' event listener
    on(event: string, listener: (...args: any[]) => void): void; // General overload for other events
  },
  res: {
    writeHead: (statusCode: number, headers: { "Content-Type": string; }) => void;
    end: (data: string) => void;
  }
) => {    
  try {     
    // 1) verify Authorization header and map to a Supabase user
    const authHeader = req.headers.get('authorization') ?? '';    
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {      
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing Authorization Bearer token' }));
      return;
    } 
    
    // call Supabase auth endpoint to get user
    const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, { 
      headers: { Authorization: `Bearer ${token}` }
    });    
    if (!userResponse.ok) {
      const txt = await userResponse.text();  
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid token', detail: txt }));
      return;
    } 
    const userJson = await userResponse.json(); 
    const callerId = userJson?.id;
    if (!callerId) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unable to resolve user from token' }));
      return;
    }   
             
        // 2) check caller is admin 
    const { data: callerProfile, error: pErr } = await supabaseAdmin.from('profiles').select('role').eq('id', callerId).single();
    if (pErr) throw pErr;
    if (callerProfile?.role !== 'admin') {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'forbidden' }));      
      return;     
    } 
             
        // 3) proceed with role change        
    let body = ''; 
    req.on('data', (chunk: string) => { body += chunk; });  
    req.on('end', async () => {         
      const { userId, newRole } = JSON.parse(body) ?? {};       
      if (!userId || !newRole) {  
        res.writeHead(400, { 'Content-Type': 'application/json' }); 
        res.end(JSON.stringify({ error: 'userId and newRole required' }));              
        return;       
      }       

      const { error } = await supabaseAdmin.from('profiles').update({ role: newRole, is_admin: newRole === 'admin' }).eq('id', userId);        
      if (error) throw error;     
      res.writeHead(200, { 'Content-Type': 'application/json' }); 
      res.end(JSON.stringify({ success: true }));    
    }); 
  } catch (e) { 
    console.error(e);
    res.writeHead(500, { 'Content-Type': 'application/json' });        
    res.end(JSON.stringify({ error: e instanceof Error ? e.message : 'unknown' }));  
  }   
});

const port = process.env.PORT || 3000;  
server.listen(port, () => { console.log(`Server running at http://localhost:${port}/`); }); 
