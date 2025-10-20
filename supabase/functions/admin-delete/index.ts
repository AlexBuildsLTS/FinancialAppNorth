import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.SUPABASE_URL ?? ""; // Declare SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

// Create Supabase client with admin privileges
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// Check if environment variables are missing
if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
  // Throw an error to prevent the function from running without the required environment variables
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
}

serve(async (req: Request) => {
  try {
    // Extract authorization token from header
    const authorizationHeader = req.headers.get('authorization');
    if (!authorizationHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const token = authorizationHeader.startsWith('Bearer ') ? authorizationHeader.slice(7) : null;

    // Check if token is missing
    if (!token) {
      return new Response(JSON.stringify({ error: 'Missing Authorization Bearer token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate the token against Supabase Auth
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Check if token is invalid
    if (!userResponse.ok) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userJson = await userResponse.json();
    const callerId = userJson?.id;

    // Check if user ID is missing
    if (!callerId) {
      return new Response(JSON.stringify({ error: 'Unable to resolve user from token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch the caller's profile and role from the 'profiles' table
    const { data: callerProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', callerId)
      .single();

    if (profileError) {
      console.error('Error fetching caller profile:', profileError);
      return new Response(JSON.stringify({ error: 'Failed to fetch caller profile' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if the caller has admin privileges
    if (!callerProfile || callerProfile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Extract the user ID to be deleted from the request body
    const body = await req.json();
    if (!body || !body.userId) {
      return new Response(JSON.stringify({ error: 'userId required in request body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const { userId } = body;

    // Use Supabase Admin Auth API to delete the user
    const adminAuth: any = (supabaseAdmin.auth as any)?.admin;

    // Check if the deleteUser function is available
    if (!adminAuth?.deleteUser) {
      return new Response(JSON.stringify({ error: 'deleteUser not available in this runtime' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Delete the user
    const { error: deleteError } = await adminAuth.deleteUser(userId);

    // If there's an error during user deletion, throw the error
    if (deleteError) {
      console.error('Error deleting user:', deleteError);
      return new Response(JSON.stringify({ error: 'Failed to delete user' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // If the user is successfully deleted, return a success response
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    // Handle any errors that occur during the process
    console.error(e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : 'An unexpected error occurred' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
function serve(arg0: (req: Request) => Promise<Response>) {
  throw new Error('Function not implemented.');
}

