const { createClient } = require('@supabase/supabase-js');
const http = require('http');

const supabaseUrl = process.env.SUPABASE_URL ?? "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

// Create Supabase client with admin privileges
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// Check if environment variables are missing
if (!supabaseUrl || !supabaseServiceRoleKey) {
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
    // Extract authorization token from header
    const authorizationHeader = req.headers['authorization'];
    if (!authorizationHeader) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing Authorization header' }));
      return;
    }

    const token = authorizationHeader.startsWith('Bearer ') ? authorizationHeader.slice(7) : null;

    // Check if token is missing
    if (!token) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing Authorization Bearer token' }));
      return;
    }

    // Validate the token against Supabase Auth
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Check if token is invalid
    if (!userResponse.ok) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid token' }));
      return;
    }

    const userJson = await userResponse.json();
    const callerId = userJson?.id;

    // Check if user ID is missing
    if (!callerId) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unable to resolve user from token' }));
      return;
    }

    // Fetch the caller's profile and role from the 'profiles' table
    // ## FIX 1: Added .schema('northfinance') ##
    const { data: callerProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .schema('northfinance')
      .select('role')
      .eq('id', callerId)
      .single();

    if (profileError) {
      console.error('Error fetching caller profile:', profileError);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to fetch caller profile' }));
      return;
    }

    // Check if the caller has admin privileges
    if (!callerProfile || callerProfile?.role !== 'admin') {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Forbidden' }));
      return;
    }

    // Extract the user ID to be deleted from the request body
    let body = '';
    req.on('data', (chunk: Buffer) => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      try {
        const parsedBody = JSON.parse(body);
        if (!parsedBody || !parsedBody.userId) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'userId required in request body' }));
          return;
        }
        const { userId } = parsedBody;

        // Use Supabase Admin Auth API to delete the user
        // This automatically deletes the 'northfinance.profiles' row
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (deleteError) {
          console.error('Error deleting user:', deleteError);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Failed to delete user' }));
          return;
        }

        // If the user is successfully deleted, return a success response
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        console.error(e);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e instanceof Error ? e.message : 'An unexpected error occurred' }));
      }
    });
  } catch (e) {
    // Handle any errors that occur during the process
    console.error(e);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: e instanceof Error ? e.message : 'An unexpected error occurred' }));
  }
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});