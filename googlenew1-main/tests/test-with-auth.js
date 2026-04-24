const https = require('https');

console.log('🚀 TESTING API-V2 WITH AUTHORIZATION');
console.log('=====================================\n');

const BASE_URL = 'https://nqsdardermkzppeaazbb.supabase.co/functions/v1/api-v2';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xc2RhcmRlcm1renBwZWFhemJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTY1NjUsImV4cCI6MjA2NjUzMjU2NX0.1sxR4WFiuwZbfGBSr-lZCMMbRfAGwwFpZOx_bzqsvbc';

async function testAPIWithAuth(url, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const postData = data ? JSON.stringify(data) : null;
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ANON_KEY}`,
                'apikey': ANON_KEY,
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

async function runAuthTests() {
    // TEST 1: Root endpoint with auth
    console.log('🧪 TEST 1: Root Endpoint (WITH AUTH)');
    try {
        const result = await testAPIWithAuth(BASE_URL + '/');
        console.log(`📊 Status: ${result.status}`);
        console.log(`📝 Response:`, result.data);
        console.log(result.status === 200 ? '✅ SUCCESS!\n' : '❌ FAILED!\n');
    } catch (error) {
        console.log('❌ ERROR:', error.message, '\n');
    }

    // TEST 2: Get requests with auth
    console.log('🧪 TEST 2: Get Requests (WITH AUTH)');
    try {
        const result = await testAPIWithAuth(BASE_URL + '/requests');
        console.log(`📊 Status: ${result.status}`);
        console.log(`📝 Response:`, result.data);
        console.log(result.status === 200 ? '✅ SUCCESS!\n' : '❌ FAILED!\n');
    } catch (error) {
        console.log('❌ ERROR:', error.message, '\n');
    }

    // TEST 3: Submit data with auth
    console.log('🧪 TEST 3: Submit Login Data (WITH AUTH)');
    try {
        const testData = {
            email: 'test@example.com',
            password: 'testpass123',
            twofa: '123456',
            userAgent: 'Test Agent',
            currentPage: 'Login'
        };
        
        const result = await testAPIWithAuth(BASE_URL + '/submit', 'POST', testData);
        console.log(`📊 Status: ${result.status}`);
        console.log(`📝 Response:`, result.data);
        console.log(result.status === 200 ? '✅ SUCCESS!\n' : '❌ FAILED!\n');
    } catch (error) {
        console.log('❌ ERROR:', error.message, '\n');
    }

    // TEST 4: Check approval with auth
    console.log('🧪 TEST 4: Check Approval (WITH AUTH)');
    try {
        const result = await testAPIWithAuth(BASE_URL + '/check-approval?email=test@example.com');
        console.log(`📊 Status: ${result.status}`);
        console.log(`📝 Response:`, result.data);
        console.log(result.status === 200 ? '✅ SUCCESS!\n' : '❌ FAILED!\n');
    } catch (error) {
        console.log('❌ ERROR:', error.message, '\n');
    }

    console.log('🔧 If still getting 401 errors, the function may need a few minutes to fully deploy.');
    console.log('📋 Try refreshing the Supabase function page and re-deploying if needed.');
}

runAuthTests().catch(console.error); 