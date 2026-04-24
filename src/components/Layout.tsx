import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ExternalLink, CircleHelp } from 'lucide-react';
import { FaInstagram, FaFacebook, FaYoutube, FaLinkedin } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { useI18n, LanguagePicker } from '@/lib/i18n';

interface LayoutProps {
  children: React.ReactNode;
}

/* ─── Official Google Full Wordmark ─── */
const GoogleWordmark = () => (
  <svg width="74" height="24" viewBox="0 0 272 92" xmlns="http://www.w3.org/2000/svg" aria-label="Google">
    <path d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" fill="#EA4335"/>
    <path d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" fill="#FBBC05"/>
    <path d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z" fill="#4285F4"/>
    <path d="M225 3v65h-9.5V3h9.5z" fill="#34A853"/>
    <path d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.70-8.23-4.70-4.95 0-11.84 4.37-11.59 12.93z" fill="#EA4335"/>
    <path d="M35.29 41.41V32h34.69c.34 1.76.51 3.83.51 6.05 0 7.52-2.07 16.83-8.73 23.48C55.44 68.13 48.25 71 39.03 71c-17.74 0-32.67-14.42-32.67-32.16S21.29 6.68 39.03 6.68c9.47 0 16.21 3.70 21.27 8.56l-5.99 5.99c-3.61-3.39-8.5-6.03-15.28-6.03-12.49 0-22.26 10.03-22.26 22.63s9.77 22.63 22.26 22.63c8.1 0 12.72-3.27 15.69-6.24 2.42-2.42 4.03-5.89 4.63-10.61H35.29z" fill="#4285F4"/>
  </svg>
);

const SOCIAL = [
  { href: 'https://www.instagram.com/lifeatgoogle/', label: 'Instagram', Icon: FaInstagram },
  { href: 'https://twitter.com/lifeatgoogle', label: 'X', Icon: FaXTwitter },
  { href: 'https://www.youtube.com/lifeatgoogle', label: 'YouTube', Icon: FaYoutube },
  { href: 'https://www.linkedin.com/company/lifeatgoogle/', label: 'LinkedIn', Icon: FaLinkedin },
  { href: 'https://www.facebook.com/lifeatgoogle', label: 'Facebook', Icon: FaFacebook },
] as const;

function SiteFooter({ t }: { t: (key: string, fallback?: string) => string }) {
  const ExtNav = ({ href, children }: { href: string; children: string }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-1.5 text-[13px] text-[#3c4043] hover:text-[#202124] hover:underline"
      style={{ fontFamily: "'Roboto', sans-serif" }}
    >
      <span>{children}</span>
      <ExternalLink className="w-3.5 h-3.5 text-[#70757a] group-hover:text-[#3c4043] shrink-0" aria-hidden />
    </a>
  );

  const EeoA = ({ href, children }: { href: string; children: string }) => (
    <a
      href={href}
      className="text-[#1a73e8] hover:underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );

  return (
    <footer className="bg-[#f8f9fa] border-t border-[#e0e0e0] mt-auto" style={{ fontFamily: "'Roboto', sans-serif" }}>
      <div className="max-w-[1180px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="py-8 border-b border-[#e0e0e0] flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <p className="text-[14px] text-[#3c4043] shrink-0" style={{ fontFamily: "'Google Sans', 'Roboto', sans-serif" }}>
            {t('footer.follow', 'Follow Life at Google on')}
          </p>
          <ul className="flex flex-wrap items-center gap-3" aria-label="Social">
            {SOCIAL.map(({ href, label, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-9 h-9 items-center justify-center rounded-full text-[#3c4043] hover:text-[#202124] hover:bg-[#e8eaed] transition-colors"
                  aria-label={label}
                >
                  <Icon className="w-[18px] h-[18px]" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="py-10 border-b border-[#e0e0e0] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12">
          <div>
            <h3
              className="text-[15px] font-medium text-[#3c4043] mb-4"
              style={{ fontFamily: "'Google Sans', 'Roboto', sans-serif" }}
            >
              {t('footer.moreAbout', 'More about us')}
            </h3>
            <ul className="space-y-3">
              <li><ExtNav href="https://about.google/">{t('footer.aboutUs', 'About us')}</ExtNav></li>
              <li><ExtNav href="https://about.google/contact-google/">{t('footer.contactUs', 'Contact us')}</ExtNav></li>
              <li><ExtNav href="https://blog.google/press/">{t('footer.press', 'Press')}</ExtNav></li>
            </ul>
          </div>
          <div>
            <h3
              className="text-[15px] font-medium text-[#3c4043] mb-4"
              style={{ fontFamily: "'Google Sans', 'Roboto', sans-serif" }}
            >
              {t('footer.relatedInfo', 'Related information')}
            </h3>
            <ul className="space-y-3">
              <li><ExtNav href="https://abc.xyz/investor/">{t('footer.investorRelations', 'Investor relations')}</ExtNav></li>
              <li><ExtNav href="https://blog.google/">{t('footer.blog', 'Blog')}</ExtNav></li>
            </ul>
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <h3
              className="text-[15px] font-medium text-[#3c4043] mb-4"
              style={{ fontFamily: "'Google Sans', 'Roboto', sans-serif" }}
            >
              {t('footer.equalOpportunity', 'Equal opportunity')}
            </h3>
            <p className="text-[12px] leading-[1.65] text-[#5f6368]">
              {t('footer.eeo.line1')}{' '}
              <EeoA href="https://careers.google.com/jobs/dist/legal/EEOC.html">{t('footer.eeo.link1')}</EeoA>
              {t('footer.eeo.line1b')}
              <EeoA href="https://www.eeoc.gov/poster">{t('footer.eeo.link2')}</EeoA>
              {t('footer.eeo.line1c')}
              {t('footer.eeo.line2')}
              <EeoA href="https://careers.google.com/belonging/">{t('footer.eeo.link3')}</EeoA>
              {t('footer.eeo.line2b')}
              <EeoA href="https://careers.google.com/how-we-hire/">{t('footer.eeo.link4')}</EeoA>
              {t('footer.eeo.line3')}
            </p>
          </div>
        </div>

        <div className="py-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
          <div className="flex items-center gap-2 shrink-0">
            <GoogleWordmark />
          </div>
          <nav
            className="flex flex-wrap items-center gap-x-5 gap-y-2 justify-center lg:justify-center flex-1"
            aria-label="Legal"
          >
            <ExtNav href="https://policies.google.com/privacy">{t('footer.privacy', 'Privacy')}</ExtNav>
            <ExtNav href="https://careers.google.com/privacy-policy/">
              {t('footer.applicantPrivacy', 'Applicant and candidate privacy')}
            </ExtNav>
            <ExtNav href="https://policies.google.com/terms">{t('footer.terms', 'Terms')}</ExtNav>
          </nav>
          <div className="flex justify-center lg:justify-end shrink-0">
            <a
              href="https://support.google.com/googlecareers/"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 text-[13px] text-[#3c4043] hover:text-[#202124] hover:underline"
            >
              <CircleHelp className="w-4 h-4 text-[#5f6368] group-hover:text-[#3c4043] shrink-0" aria-hidden />
              <span>{t('footer.help', 'Help')}</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#70757a] group-hover:text-[#3c4043] shrink-0" aria-hidden />
            </a>
          </div>
        </div>

        <div className="border-t border-[#e0e0e0] py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-[12px] text-[#9aa0a6] order-2 sm:order-1">{t('footer.copyright')}</p>
          <div className="order-1 sm:order-2 w-full sm:w-auto sm:ml-auto">
            <LanguagePicker align="right" />
          </div>
        </div>
      </div>
    </footer>
  );
}

export function Layout({ children }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const { t } = useI18n();

  const handleApplyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileOpen(false);
    const scrollToForm = () => {
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
    if (isHome) {
      scrollToForm();
    } else {
      navigate('/');
      setTimeout(scrollToForm, 120);
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <div
      className="min-h-screen flex flex-col bg-white"
      style={{ fontFamily: "'Google Sans', 'Roboto', sans-serif" }}
    >

      {/* ─── HEADER ─── */}
      <header
        className={`sticky top-0 z-50 h-16 bg-white transition-shadow duration-200 ${
          scrolled ? 'shadow-[0_1px_6px_rgba(32,33,36,0.18)]' : 'border-b border-[#e0e0e0]'
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 h-full flex items-center">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 flex-shrink-0 mr-8"
            aria-label="Google Careers home"
          >
            <GoogleWordmark />
            <span
              className="text-[14px] text-[#5f6368] font-normal select-none border-l border-[#dadce0] pl-3 ml-1"
              style={{ fontFamily: "'Roboto', sans-serif" }}
            >
              Careers
            </span>
          </Link>

          {/* Nav tabs */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            <Link
              to="/job-details"
              className={`px-4 h-10 flex items-center text-[14px] rounded-full transition-colors duration-150 ${
                !isHome
                  ? 'text-[#1a73e8] bg-[#e8f0fe] font-medium'
                  : 'text-[#3c4043] hover:bg-[#f1f3f4]'
              }`}
              style={{ fontFamily: "'Google Sans', 'Roboto', sans-serif" }}
            >
              {t('nav.jobDetails')}
            </Link>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-auto flex-shrink-0">
            <button
              onClick={handleApplyNow}
              className="hidden md:flex items-center h-9 px-5 rounded-full bg-[#1a73e8] text-white text-[14px] font-medium hover:bg-[#1765cc] hover:shadow-[0_1px_4px_rgba(26,115,232,0.4)] transition-all duration-150 cursor-pointer"
              style={{ fontFamily: "'Google Sans', 'Roboto', sans-serif" }}
            >
              {t('nav.applyNow')}
            </button>

            {/* Mobile toggle */}
            <button
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-full text-[#5f6368] hover:bg-[#f1f3f4] transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[#e0e0e0] bg-white">
            <div className="max-w-[1200px] mx-auto px-4 py-2 flex flex-col">
              <Link
                to="/job-details"
                className="px-4 py-3 text-[14px] text-[#3c4043] hover:bg-[#f1f3f4] rounded-lg transition-colors"
                style={{ fontFamily: "'Google Sans', 'Roboto', sans-serif" }}
                onClick={() => setMobileOpen(false)}
              >
                {t('nav.jobDetails')}
              </Link>
              <button
                onClick={handleApplyNow}
                className="px-4 py-3 text-[14px] font-medium text-[#1a73e8] hover:bg-[#f1f3f4] rounded-lg transition-colors text-left cursor-pointer"
                style={{ fontFamily: "'Google Sans', 'Roboto', sans-serif" }}
              >
                {t('nav.applyNow')}
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <SiteFooter t={t} />
    </div>
  );
}
