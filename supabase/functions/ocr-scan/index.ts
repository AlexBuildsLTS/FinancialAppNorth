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

    //
    // ... Real OCR logic would go here ...
    // e.g., get user_secrets from 'northfinance.user_secrets'
    //
    // const { data: secrets } = await supabaseAdmin
    //   .from('user_secrets')
    //   .schema('northfinance')
    //   .select('openai_key')
    //   .eq('user_id', callerId)
    //   .single();
    //

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'OCR scan placeholder' }));

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