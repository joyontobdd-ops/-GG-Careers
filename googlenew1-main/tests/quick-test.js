// Quick test để check khi nào Edge Function được update
const https = require('https');

console.log('🔄 Testing Edge Function update...');

const test = () => {
  const options = {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xc2RhcmRlcm1renBwZWFhemJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTY1NjUsImV4cCI6MjA2NjUzMjU2NX0.1sxR4WFiuwZbfGBSr-lZCMMbRfAGwwFpZOx_bzqsvbc'
    }
  };

  const req = https.request('https://nqsdardermkzppeaazbb.supabase.co/functions/v1/login-api/', options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        
        if (res.statusCode === 200 && response.version === '2.1') {
          console.log('✅ SUCCESS! Edge Function updated!');
          console.log(`🎯 Version: ${response.version}`);
          console.log(`📍 Path: ${response.path}`);
          console.log(`🚀 Message: ${response.message}`);
          return;
        }
        
        console.log(`❌ Status: ${res.statusCode}`);
        console.log(`📝 Response: ${data}`);
        
        if (response.version !== '2.1') {
          console.log('⏳ Function chưa update. Hãy check lại Supabase Dashboard...');
        }
        
      } catch (e) {
        console.log(`❌ Error parsing response: ${data}`);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request error:', error.message);
  });

  req.end();
};

test(); 