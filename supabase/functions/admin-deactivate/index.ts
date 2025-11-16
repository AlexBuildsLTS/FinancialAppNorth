const { createClient } = require('@supabase/supabase-js');
const http = require('http');

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
    process.exit(1);
}

const server = http.createServer(async (req: import('http').IncomingMessage, res: import('http').ServerResponse) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    try {
        const authHeader = req.headers['authorization'] ?? '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
        if (!token) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing Authorization Bearer token' }));
            return;
        }

        const userResp = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { Authorization: `Bearer ${token}` } });
        if (!userResp.ok) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid token' }));
            return;
        }
        const userJson = await userResp.json();
        const callerId = userJson?.id;
        if (!callerId) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Unable to resolve user from token' }));
            return;
        }

        // ## FIX 1: Added .schema('northfinance') ##
        const { data: callerProfile, error: pErr } = await supabaseAdmin
            .from('profiles')
            .schema('northfinance')
            .select('role')
            .eq('id', callerId)
            .single();
            
        if (pErr) {
            console.error('Error fetching caller profile:', pErr);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to fetch caller profile' }));
            return;
        }
        if (callerProfile?.role !== 'admin') {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'forbidden' }));
            return;
        }

        let body = '';
        req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                const { userId } = JSON.parse(body) ?? {};
                if (!userId) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'userId required' }));
                    return;
                }

                // try revoke tokens (may not be available in some runtimes)
                try {
                    const { error: revokeErr } = await supabaseAdmin.auth.admin.signOut(userId);
                    if (revokeErr) throw revokeErr;
                } catch (e) {
                    console.warn('signOut unavailable or failed', e);
                }

                // ## FIX 2: Added .schema('northfinance') ##
                const { error } = await supabaseAdmin
                    .from('profiles')
                    .schema('northfinance')
                    .update({ is_admin: false })
                    .eq('id', userId);
                    
                if (error) throw error;

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (e) {
                console.error(e);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: e instanceof Error ? e.message : 'unknown' }));
            }
        });
    } catch (e) {
        console.error(e);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e instanceof Error ? e.message : 'unknown' }));
    }
});

const port = process.env.PORT || 3000;
server.listen(port, () => { console.log(`Server running at http://localhost:${port}/`); });