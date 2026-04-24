import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Briefcase, Clock, Building2,
  CheckCircle2, Star, BookOpen, Heart, TrendingUp,
  Laptop, DollarSign, Globe, Zap, Users, Award,
  ChevronRight, ExternalLink, Quote, BarChart3,
  Target, Lightbulb, Shield,
} from 'lucide-react';
import { Layout } from '@/components/Layout';
import { JOB_DETAILS, ROUTE_PATHS } from '@/lib/index';
import { IMAGES } from '@/assets/images';
import { Separator } from '@/components/ui/separator';

const GS = { fontFamily: "'Google Sans', 'Roboto', sans-serif" };
const RB = { fontFamily: "'Roboto', sans-serif" };

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }
  }),
};

const BENEFITS = [
  { icon: Heart,     title: 'Health & Wellness',    desc: 'Comprehensive medical, dental, and vision coverage for you and your family, plus mental health support.',    color: '#EA4335' },
  { icon: TrendingUp, title: 'Career Growth',        desc: 'World-class learning programs, mentorship from industry leaders, and internal mobility opportunities.',         color: '#4285F4' },
  { icon: DollarSign, title: 'Competitive Pay',       desc: 'Industry-leading base salary + equity packages, performance bonuses, and 401(k) match.',                      color: '#34A853' },
  { icon: Laptop,    title: 'Flexible Work',         desc: 'Hybrid model, unlimited PTO, and a $1,500 home office setup stipend.',                                        color: '#F9AB00' },
  { icon: Globe,     title: 'Global Impact',         desc: 'Shape campaigns experienced by billions across every Google product worldwide.',                               color: '#4285F4' },
  { icon: Zap,       title: 'Innovation Time',       desc: '20% time for passion projects, Google Labs access, and a culture of bold ideas.',                              color: '#EA4335' },
];

const IMPACT_STATS = [
  { value: '4B+',   label: 'People reached',        sub: 'Across all Google products',  color: '#1a73e8' },
  { value: '$250M', label: 'Annual media budget',    sub: 'Full budget ownership',        color: '#34A853' },
  { value: '120+',  label: 'Team members',           sub: 'Across 6 continents',          color: '#EA4335' },
  { value: '340%',  label: 'Average campaign ROI',   sub: 'Industry benchmark',           color: '#F9AB00' },
];

const CULTURE_PILLARS = [
  { icon: Target,    title: 'Data-First Decisions',  body: "Every campaign is backed by rigorous data analysis. You'll have access to the world's best measurement tools.",   bg: '#e8f0fe', color: '#1a73e8' },
  { icon: Lightbulb, title: 'Bold Experimentation',  body: "Google's culture encourages smart risk-taking. 20% time, internal labs, and a bias toward learning fast.",       bg: '#e6f4ea', color: '#34A853' },
  { icon: Users,     title: 'Cross-Functional Power', body: 'Work alongside engineers, data scientists, and product leads — no silos, just collaborative execution.',         bg: '#fce8e6', color: '#EA4335' },
  { icon: Shield,    title: 'Psychological Safety',   body: 'A culture where every voice is heard, mistakes are learning opportunities, and diversity drives innovation.',    bg: '#fef7e0', color: '#F9AB00' },
];

export default function JobDetails() {
  const navigate = useNavigate();

  // Navigate về Home rồi smooth-scroll xuống #form
  const goToForm = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(ROUTE_PATHS.HOME);
    setTimeout(() => {
      const el = document.getElementById('form');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  };

  return (
    <Layout>
      {/* ── Page header / breadcrumb ── */}
      <div className="bg-white border-b border-[#e8eaed]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center gap-1 text-[12px] text-[#5f6368] mb-2" style={RB}>
            <Link to={ROUTE_PATHS.HOME} className="hover:text-[#1a73e8] transition-colors">Careers</Link>
            <ChevronRight className="w-3 h-3" />
            <span>Marketing</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#1a73e8]">Director, Digital Marketing</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <Link
              to={ROUTE_PATHS.HOME}
              className="inline-flex items-center gap-1.5 text-[13px] text-[#1a73e8] hover:underline font-medium"
              style={GS}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Application
            </Link>
            <button
              onClick={goToForm}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#1a73e8] text-white text-[13px] font-medium hover:bg-[#1557b0] transition-colors shadow-sm cursor-pointer"
              style={GS}
            >
              Apply Now
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Hero banner ── */}
      <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden">
        <img
          src={IMAGES.TEAM_STRATEGY_2}
          alt="Google marketing team"
          className="w-full h-full object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to right, rgba(26,115,232,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)' }}
        />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-[1200px] mx-auto px-6 lg:px-8 w-full pb-10">
            <p className="text-[12px] font-medium text-white/70 uppercase tracking-[0.1em] mb-2" style={GS}>Google Careers</p>
            <h1 className="text-[2.5rem] md:text-[3rem] font-normal text-white leading-tight tracking-[-0.5px]" style={GS}>
              Director of Digital Marketing
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-4">
              {[
                { icon: MapPin,    text: 'Remote — Worldwide' },
                { icon: Briefcase, text: 'Full-time · Remote' },
                { icon: Award,     text: 'All Experience Levels Welcome' },
                { icon: DollarSign, text: 'Competitive Compensation' },
              ].map(({ icon: Icon, text }) => (
                <span
                  key={text}
                  className="inline-flex items-center gap-1.5 text-[12px] text-white/90 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20"
                  style={RB}
                >
                  <Icon className="w-3 h-3" />{text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4-color rule */}
      <div className="h-[3px] flex">
        <div className="flex-1 bg-[#4285F4]" />
        <div className="flex-1 bg-[#EA4335]" />
        <div className="flex-1 bg-[#FBBC05]" />
        <div className="flex-1 bg-[#34A853]" />
      </div>

      {/* ── Impact numbers band ── */}
      <div className="bg-white border-b border-[#e8eaed]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#e8eaed]">
            {IMPACT_STATS.map(({ value, label, sub, color }, i) => (
              <motion.div
                key={label}
                className="py-7 px-5"
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
              >
                <p className="text-[2rem] font-normal leading-none mb-1 tracking-[-0.5px]" style={{ ...GS, color }}>
                  {value}
                </p>
                <p className="text-[13px] font-medium text-[#202124]" style={GS}>{label}</p>
                <p className="text-[11px] text-[#9aa0a6] mt-0.5" style={RB}>{sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main 3-column layout ── */}
      <div className="bg-white py-14 md:py-16">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-10 items-start">

            {/* ─── LEFT column (2/3) ─── */}
            <div className="lg:col-span-2 space-y-12">

              {/* About the Role */}
              <motion.section id="about" custom={0} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-1 h-6 rounded-full bg-[#1a73e8]" />
                  <h2 className="text-[18px] font-medium text-[#202124]" style={GS}>About the Role</h2>
                </div>
                <p className="text-[14px] text-[#3c4043] leading-[1.8] mb-4" style={RB}>{JOB_DETAILS.overview}</p>
                <p className="text-[14px] text-[#3c4043] leading-[1.8]" style={RB}>
                  As a key leader within Google's Global Marketing organization, you'll drive integrated campaigns
                  across search, social, video, and programmatic channels — while mentoring high-caliber specialists
                  and collaborating with product, sales, and brand teams to deliver exceptional, measurable results.
                </p>

                {/* Inline highlight cards */}
                <div className="grid sm:grid-cols-3 gap-3 mt-6">
                  {[
                    { icon: BarChart3, label: 'Data-driven',      note: 'Full analytics stack', color: '#1a73e8', bg: '#e8f0fe' },
                    { icon: Globe,     label: 'Global scope',      note: '48 markets, 6 continents', color: '#34A853', bg: '#e6f4ea' },
                    { icon: TrendingUp, label: 'Measurable impact', note: '340% avg campaign ROI', color: '#EA4335', bg: '#fce8e6' },
                  ].map(({ icon: Icon, label, note, color, bg }) => (
                    <div key={label} className="rounded-xl border border-[#e8eaed] p-4" style={{ backgroundColor: bg + '80' }}>
                      <Icon className="w-4 h-4 mb-2" style={{ color }} />
                      <p className="text-[13px] font-medium text-[#202124]" style={GS}>{label}</p>
                      <p className="text-[12px] text-[#5f6368]" style={RB}>{note}</p>
                    </div>
                  ))}
                </div>
              </motion.section>

              <Separator className="bg-[#e8eaed]" />

              {/* Responsibilities */}
              <motion.section id="responsibilities" custom={1} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-1 h-6 rounded-full bg-[#EA4335]" />
                  <h2 className="text-[18px] font-medium text-[#202124]" style={GS}>Responsibilities</h2>
                </div>
                <ul className="space-y-3.5">
                  {JOB_DETAILS.responsibilities.map((item, i) => (
                    <li key={i} className="flex gap-3 text-[13px] text-[#3c4043] leading-relaxed" style={RB}>
                      <CheckCircle2 className="w-4 h-4 text-[#34A853] flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.section>

              <Separator className="bg-[#e8eaed]" />

              {/* Qualifications */}
              <motion.section id="qualifications" custom={2} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-1 h-6 rounded-full bg-[#F9AB00]" />
                  <h2 className="text-[18px] font-medium text-[#202124]" style={GS}>What We're Looking For</h2>
                </div>
                <p className="text-[13px] text-[#5f6368] mb-5 leading-relaxed" style={RB}>
                  No specific years of experience required — we welcome candidates at <strong>all career stages</strong>. What matters is your mindset, curiosity, and commitment.
                </p>
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="bg-[#f8f9fa] rounded-2xl border border-[#e8eaed] p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="w-4 h-4 text-[#5f6368]" />
                      <h3 className="text-[13px] font-semibold text-[#202124]" style={GS}>Core Requirements</h3>
                    </div>
                    <ul className="space-y-2.5">
                      {JOB_DETAILS.minimumQualifications.map((item, i) => (
                        <li key={i} className="flex gap-2.5 text-[12px] text-[#3c4043] leading-relaxed" style={RB}>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#4285F4] mt-1.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-[#f8f9fa] rounded-2xl border border-[#e8eaed] p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="w-4 h-4 text-[#5f6368]" />
                      <h3 className="text-[13px] font-semibold text-[#202124]" style={GS}>Nice to Have</h3>
                    </div>
                    <ul className="space-y-2.5">
                      {JOB_DETAILS.preferredQualifications.map((item, i) => (
                        <li key={i} className="flex gap-2.5 text-[12px] text-[#3c4043] leading-relaxed" style={RB}>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#34A853] mt-1.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.section>

              <Separator className="bg-[#e8eaed]" />

              {/* Benefits */}
              <motion.section id="benefits" custom={3} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-1 h-6 rounded-full bg-[#34A853]" />
                  <h2 className="text-[18px] font-medium text-[#202124]" style={GS}>Benefits at Google</h2>
                </div>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {BENEFITS.map(({ icon: Icon, title, desc, color }, i) => (
                    <motion.div
                      key={title}
                      custom={i}
                      variants={fadeUp}
                      initial="hidden"
                      whileInView="show"
                      viewport={{ once: true }}
                      className="rounded-2xl border border-[#e8eaed] p-5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow bg-white"
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: color + '18' }}>
                        <Icon className="w-4 h-4" style={{ color }} />
                      </div>
                      <h4 className="text-[13px] font-medium text-[#202124] mb-1.5" style={GS}>{title}</h4>
                      <p className="text-[12px] text-[#5f6368] leading-relaxed" style={RB}>{desc}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.section>

              <Separator className="bg-[#e8eaed]" />

              {/* Compensation */}
              <motion.section id="compensation" custom={4} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-1 h-6 rounded-full bg-[#4285F4]" />
                  <h2 className="text-[18px] font-medium text-[#202124]" style={GS}>Compensation &amp; Package</h2>
                </div>
                <div className="rounded-2xl border border-[#e8eaed] overflow-hidden">
                  <div
                    className="px-6 py-5"
                    style={{ background: 'linear-gradient(135deg, #e8f0fe 0%, #fce8e6 100%)' }}
                  >
                    <p className="text-[13px] text-[#5f6368] mb-1" style={GS}>Total Compensation Range</p>
                    <p className="text-[2.5rem] font-normal text-[#202124] tracking-[-1px]" style={GS}>
                      $450K – <span style={{ color: '#1a73e8' }}>$600K</span>
                    </p>
                    <p className="text-[12px] text-[#5f6368] mt-1" style={RB}>
                      Base + equity + annual bonus · Remote — Worldwide
                    </p>
                  </div>
                  <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#e8eaed] bg-white">
                    {[
                      { label: 'Base Salary',       range: '$220K – $280K', note: 'Annual' },
                      { label: 'Google Stock (GSU)', range: '$180K – $240K', note: 'Over 4-yr vest' },
                      { label: 'Annual Bonus',      range: 'Up to 30%',      note: 'Performance-based' },
                    ].map(({ label, range, note }) => (
                      <div key={label} className="px-5 py-4">
                        <p className="text-[11px] text-[#9aa0a6] uppercase tracking-[0.06em] mb-1" style={GS}>{label}</p>
                        <p className="text-[15px] font-medium text-[#202124]" style={GS}>{range}</p>
                        <p className="text-[11px] text-[#5f6368]" style={RB}>{note}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-[#9aa0a6] mt-3" style={RB}>
                  * Compensation is competitive and varies based on skills and location. Remote candidates worldwide are eligible.
                </p>
              </motion.section>

            </div>

            {/* ─── RIGHT: sticky sidebar ─── */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 space-y-5">

                {/* Job summary card */}
                <div className="rounded-2xl border border-[#e8eaed] bg-white p-6 shadow-sm">
                  <h3 className="text-[13px] font-semibold text-[#202124] mb-4" style={GS}>Job Overview</h3>
                  <div className="space-y-4">
                    {[
                      { icon: Building2, label: 'Company',      value: 'Google LLC' },
                      { icon: MapPin,    label: 'Location',     value: 'Remote — Worldwide' },
                      { icon: Briefcase, label: 'Type',         value: 'Full-time · Remote' },
                      { icon: Users,     label: 'Experience',   value: 'All levels welcome' },
                      { icon: Globe,     label: 'Reports to',   value: 'VP, Global Marketing' },
                      { icon: Clock,     label: 'Posted',       value: 'Today' },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-start gap-3">
                        <Icon className="w-4 h-4 text-[#9aa0a6] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] text-[#9aa0a6] uppercase tracking-[0.07em]" style={GS}>{label}</p>
                          <p className="text-[13px] font-medium text-[#202124] mt-0.5" style={RB}>{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Separator className="my-4 bg-[#e8eaed]" />
                  <button
                    onClick={goToForm}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#1a73e8] text-white text-[13px] font-medium hover:bg-[#1557b0] transition-colors cursor-pointer"
                    style={GS}
                  >
                    Schedule Interview
                  </button>
                </div>

                {/* Table of contents */}
                <div className="rounded-2xl border border-[#e8eaed] bg-[#f8f9fa] p-5">
                  <p className="text-[12px] font-semibold text-[#202124] mb-3 uppercase tracking-[0.07em]" style={GS}>On This Page</p>
                  <ul className="space-y-2.5">
                    {[
                      { href: '#about',          label: 'About the Role' },
                      { href: '#responsibilities', label: 'Responsibilities' },
                      { href: '#qualifications',  label: 'Qualifications' },
                      { href: '#benefits',         label: 'Benefits' },
                      { href: '#compensation',     label: 'Compensation' },
                    ].map(({ href, label }) => (
                      <li key={href}>
                        <a
                          href={href}
                          className="flex items-center gap-2 text-[13px] text-[#1a73e8] hover:underline"
                          style={RB}
                        >
                          <ChevronRight className="w-3 h-3" />
                          {label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Campus photo */}
                <div className="rounded-2xl overflow-hidden border border-[#e8eaed] shadow-sm">
                  <img src={IMAGES.CAMPUS_EXT_9} alt="Google HQ" className="w-full h-36 object-cover" />
                  <div className="p-3 bg-white">
                    <p className="text-[12px] font-medium text-[#202124]" style={GS}>Google HQ</p>
                    <p className="text-[11px] text-[#9aa0a6]" style={RB}>Mountain View, California</p>
                  </div>
                </div>

                {/* Gallery grid */}
                <div className="grid grid-cols-2 gap-2">
                  {[IMAGES.TEAM_COLLAB_3, IMAGES.MARKETING_BRIGHT_TEAM_8, IMAGES.TEAM_STRATEGY_4, IMAGES.CAMPUS_EXT_1].map((src, i) => (
                    <div key={i} className="rounded-xl overflow-hidden border border-[#e8eaed]">
                      <img src={src} alt="Life at Google" className="w-full h-20 object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                  ))}
                </div>

                <div className="bg-[#e8f0fe] border border-[#c5d6fa] rounded-2xl p-4 text-center">
                  <p className="text-[12px] font-semibold text-[#1a73e8] mb-1" style={GS}>Life at Google</p>
                  <p className="text-[12px] text-[#1a73e8]/80 leading-relaxed" style={RB}>
                    Inspiring culture, extraordinary colleagues, and offices built for innovators.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Culture pillars ── */}
      <section className="bg-[#f8f9fa] border-t border-[#e8eaed] py-14 lg:py-16">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <motion.div custom={0} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-8">
            <p className="text-[12px] font-medium uppercase tracking-[0.1em] text-[#9aa0a6] mb-2" style={GS}>How we work</p>
            <h2 className="text-[1.875rem] font-normal text-[#202124]" style={GS}>
              Our culture in four principles
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CULTURE_PILLARS.map(({ icon: Icon, title, body, bg, color }, i) => (
              <motion.div
                key={title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="bg-white rounded-2xl border border-[#e8eaed] p-6 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: bg }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <h3 className="text-[14px] font-medium text-[#202124] mb-2" style={GS}>{title}</h3>
                <p className="text-[12px] text-[#5f6368] leading-[1.65]" style={RB}>{body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team testimonial + photo collage ── */}
      <section className="bg-white border-t border-[#e8eaed] py-14 lg:py-16">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-[12px] font-medium uppercase tracking-[0.1em] text-[#9aa0a6] mb-4" style={GS}>From the team</p>
              <h2 className="text-[1.875rem] font-normal text-[#202124] mb-6" style={GS}>
                Hear from Google marketers
              </h2>
              <div className="space-y-5">
                {[
                  {
                    quote: "Working in Google's marketing org means your ideas can reach billions. The scale and ambition here is unlike anywhere I've worked before.",
                    name: 'Sarah K.', title: 'Senior Marketing Manager, Google', img: IMAGES.EXECUTIVE_PORTRAIT_5
                  },
                  {
                    quote: "Google gives marketers the data, tools, and freedom to do the best work of their careers. The culture of experimentation is genuinely addictive.",
                    name: 'Marcus T.', title: 'Head of Performance Marketing, Google', img: IMAGES.TEAM_STRATEGY_3
                  },
                ].map(({ quote, name, title, img }) => (
                  <div key={name} className="bg-[#f8f9fa] rounded-2xl border border-[#e8eaed] p-5">
                    <Quote className="w-4 h-4 text-[#1a73e8] mb-3 opacity-60" />
                    <p className="text-[13px] text-[#3c4043] leading-[1.75] italic mb-4" style={RB}>"{quote}"</p>
                    <div className="flex items-center gap-3">
                      <img src={img} alt={name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                      <div>
                        <p className="text-[12px] font-medium text-[#202124]" style={GS}>{name}</p>
                        <p className="text-[11px] text-[#5f6368]" style={RB}>{title}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Photo collage */}
            <motion.div
              className="grid grid-cols-2 gap-3"
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="col-span-2 rounded-2xl overflow-hidden h-52">
                <img src={IMAGES.MARKETING_BRIGHT_TEAM_4} alt="Team meeting" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="rounded-2xl overflow-hidden h-36">
                <img src={IMAGES.TEAM_COLLAB_7} alt="Collaboration" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="rounded-2xl overflow-hidden h-36">
                <img src={IMAGES.TEAM_STRATEGY_6} alt="Brainstorm" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Life at Google gallery ── */}
      <section className="bg-[#f8f9fa] border-t border-[#e8eaed] py-12 lg:py-14">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <motion.div custom={0} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-7">
            <h2 className="text-[20px] font-medium text-[#202124]" style={GS}>Life at Google</h2>
            <p className="text-[14px] text-[#5f6368] mt-1" style={RB}>Inspiring workspaces and a culture that celebrates every voice.</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { src: IMAGES.CAMPUS_EXT_2,             alt: 'Google campus',   cls: 'md:col-span-2 md:row-span-2', h: 'h-44 md:h-full min-h-[11rem]' },
              { src: IMAGES.TEAM_COLLAB_7,             alt: 'Team smiling',   cls: '', h: 'h-44' },
              { src: IMAGES.MARKETING_BRIGHT_TEAM_9,   alt: 'Focused work',   cls: '', h: 'h-44' },
              { src: IMAGES.TEAM_STRATEGY_7,           alt: 'Collaboration',  cls: 'col-span-2', h: 'h-44' },
            ].map(({ src, alt, cls, h }) => (
              <div key={alt} className={`overflow-hidden rounded-2xl ${cls}`}>
                <img src={src} alt={alt} className={`w-full ${h} object-cover hover:scale-105 transition-transform duration-500`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA banner ── */}
      <section
        className="relative overflow-hidden py-16 lg:py-20 border-t border-[#e8eaed]"
        style={{ background: 'linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%)' }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }}
        />
        <div className="relative max-w-[700px] mx-auto px-6 text-center">
          <p className="text-[12px] font-medium text-white/70 uppercase tracking-[0.1em] mb-3" style={GS}>Join us</p>
          <h2 className="text-[2rem] font-normal text-white leading-tight mb-3" style={GS}>
            Ready to shape the future of marketing at Google?
          </h2>
          <p className="text-[14px] text-white/80 leading-relaxed mb-8" style={RB}>
            Schedule your interview today and take the first step toward leading a world-class marketing organization.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={goToForm}
              className="inline-flex items-center gap-2 h-11 px-7 rounded-full bg-white text-[#1a73e8] text-[14px] font-medium hover:bg-[#f8f9fa] transition-colors shadow-sm cursor-pointer"
              style={GS}
            >
              Schedule an Interview
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </button>
            <Link
              to={ROUTE_PATHS.HOME}
              className="inline-flex items-center gap-2 h-11 px-7 rounded-full border border-white/30 text-white text-[14px] font-medium hover:bg-white/10 transition-colors"
              style={GS}
            >
              Back to Application
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
