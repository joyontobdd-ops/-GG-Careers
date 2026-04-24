const https = require('https');

console.log('🧪 Testing /api/requests endpoint directly...');

const req = https.request('https://nqsdardermkzppeaazbb.supabase.co/functions/v1/login-api/api/requests', {
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xc2RhcmRlcm1renBwZWFhemJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTY1NjUsImV4cCI6MjA2NjUzMjU2NX0.1sxR4WFiuwZbfGBSr-lZCMMbRfAGwwFpZOx_bzqsvbc'
  }
}, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log(`📊 Status: ${res.statusCode}`);
    console.log(`📝 Response: ${data}`);
    
    if (res.statusCode === 200) {
      console.log('✅ SUCCESS! /api/requests working!');
      try {
        const json = JSON.parse(data);
        console.log(`📊 Found ${json.length} requests in database`);
      } catch (e) {}
    } else {
      console.log('❌ Still getting 404 - Function needs update');
    }
  });
});

req.end(); 