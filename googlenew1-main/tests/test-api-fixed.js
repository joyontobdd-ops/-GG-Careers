// Test Edge Function login-api AFTER FIX
const https = require('https');

const testAPI = (url, headers = {}) => {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xc2RhcmRlcm1renBwZWFhemJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTY1NjUsImV4cCI6MjA2NjUzMjU2NX0.1sxR4WFiuwZbfGBSr-lZCMMbRfAGwwFpZOx_bzqsvbc',
        ...headers
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`\n🧪 Testing: ${url}`);
        console.log(`📊 Status: ${res.statusCode}`);
        console.log(`📝 Response:`, data);
        resolve({ status: res.statusCode, data: JSON.parse(data) });
      });
    });

    req.on('error', reject);
    req.end();
  });
};

async function runTests() {
  console.log('🚀 TESTING FIXED EDGE FUNCTION...\n');

  try {
    // Test root endpoint
    const result = await testAPI('https://nqsdardermkzppeaazbb.supabase.co/functions/v1/login-api/');
    
    if (result.status === 200 && result.data.success) {
      console.log('\n✅ SUCCESS! Edge Function is working!');
      console.log(`🎯 Version: ${result.data.version}`);
      console.log(`📍 Path detected: ${result.data.path}`);
    } else {
      console.log('\n❌ Still not working...');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  console.log('\n🔄 Now test /api/requests endpoint...');
  
  try {
    const result = await testAPI('https://nqsdardermkzppeaazbb.supabase.co/functions/v1/login-api/api/requests');
    
    if (result.status === 200) {
      console.log('\n✅ /api/requests working!');
      console.log(`📊 Found ${result.data.length} requests in database`);
    } else {
      console.log('\n❌ /api/requests failed');
    }
    
  } catch (error) {
    console.error('❌ Requests test failed:', error.message);
  }
}

console.log('⏳ UPDATE THE EDGE FUNCTION CODE FIRST, THEN RUN: node test-api-fixed.js');
runTests(); 