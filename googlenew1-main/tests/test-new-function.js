// Test function mới api-v2
const https = require('https');

const test = (url) => {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xc2RhcmRlcm1renBwZWFhemJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTY1NjUsImV4cCI6MjA2NjUzMjU2NX0.1sxR4WFiuwZbfGBSr-lZCMMbRfAGwwFpZOx_bzqsvbc'
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`\n🧪 Testing: ${url}`);
        console.log(`📊 Status: ${res.statusCode}`);
        console.log(`📝 Response: ${data}`);
        
        try {
          const json = JSON.parse(data);
          if (res.statusCode === 200 && json.success) {
            console.log('✅ SUCCESS! Function working!');
          }
        } catch (e) {}
        
        resolve({ status: res.statusCode, data });
      });
    });

    req.on('error', reject);
    req.end();
  });
};

async function testNewFunction() {
  console.log('🚀 Testing NEW function api-v2...\n');
  
  try {
    // Test root
    await test('https://nqsdardermkzppeaazbb.supabase.co/functions/v1/api-v2/');
    
    // Test requests endpoint  
    await test('https://nqsdardermkzppeaazbb.supabase.co/functions/v1/api-v2/requests');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

console.log('📝 Tạo function "api-v2" trước, sau đó chạy test này!');
testNewFunction(); 