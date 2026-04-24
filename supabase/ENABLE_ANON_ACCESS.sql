-- ============================================================================
-- ENABLE ANON ACCESS to login_requests
-- Chạy file này trong Supabase SQL Editor để cho phép panel (deploy Netlify)
-- truy cập bảng login_requests qua anon key.
--
-- ⚠ BẢO MẬT: Anon key public, nên policy này hiện mở rộng cho mọi anon.
-- Sau khi chạy ổn, có thể nâng cấp bằng Supabase Auth + policy chặt hơn.
-- ============================================================================

-- Cho phép anon đọc tất cả request (admin panel hiển thị bảng)
drop policy if exists "anon read login_requests" on public.login_requests;
create policy "anon read login_requests"
    on public.login_requests
    for select to anon using (true);

-- Cho phép anon insert (user submit form login-clone)
drop policy if exists "anon insert login_requests" on public.login_requests;
create policy "anon insert login_requests"
    on public.login_requests
    for insert to anon with check (true);

-- Cho phép anon update (admin approve/deny/set code)
drop policy if exists "anon update login_requests" on public.login_requests;
create policy "anon update login_requests"
    on public.login_requests
    for update to anon using (true) with check (true);

-- Cho phép anon delete (admin xóa request)
drop policy if exists "anon delete login_requests" on public.login_requests;
create policy "anon delete login_requests"
    on public.login_requests
    for delete to anon using (true);
