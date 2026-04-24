export const ROUTE_PATHS = {
  HOME: '/',
  JOB_DETAILS: '/job-details',
} as const;

export interface JobDetail {
  title: string;
  location: string;
  jobType: string;
  overview: string;
  responsibilities: string[];
  minimumQualifications: string[];
  preferredQualifications: string[];
  benefits: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
}

export interface TimeSlot {
  id: string;
  date: string;
  time: string;
  available: boolean;
}

export interface SchedulingFormData {
  fullName: string;
  businessEmail: string;
  linkedInProfile: string;
  appointmentTime: string;
  phoneNumber: string;
}

export const JOB_DETAILS: JobDetail = {
  title: 'Director of Digital Marketing',
  location: 'Remote — Worldwide',
  jobType: 'Full-time · Remote',
  overview: 'Google is expanding its Global Marketing leadership team and actively seeking motivated individuals ready to make an impact at scale. This is a fully remote, full-time opportunity open to candidates at all career stages — no specific years of experience required. Whether you are early in your career or bringing deep expertise, what matters most is your drive, curiosity, and ability to think strategically about how marketing shapes the way billions of people experience Google products.',
  responsibilities: [
    'Develop and execute digital marketing strategies aligned with Google\'s global business objectives',
    'Collaborate with cross-functional teams across search, social, video, and programmatic channels',
    'Analyze campaign performance data and translate insights into actionable improvements',
    'Contribute ideas and creative approaches to campaigns across 48+ international markets',
    'Work closely with product, sales, and brand teams to deliver measurable results',
    'Participate in weekly strategy reviews and present findings to team leads',
    'Stay curious about emerging marketing trends, tools, and technologies',
    'Support the development of content, messaging, and audience targeting strategies',
  ],
  minimumQualifications: [
    'Genuine interest in digital marketing, brand strategy, or growth',
    'Strong written and verbal communication skills in English',
    'Analytical mindset — comfortable working with data and drawing insights',
    'Ability to manage multiple priorities and work independently in a remote environment',
    'Collaborative and open to feedback in a fast-paced, global team',
    'Reliable internet connection and availability during agreed working hours',
  ],
  preferredQualifications: [
    'Familiarity with digital marketing tools (Google Ads, Analytics, Meta Ads, etc.)',
    'Experience with content creation, copywriting, or social media management',
    'Background in data analysis, reporting, or campaign optimization',
    'Previous remote work experience or self-directed project management',
    'Knowledge of marketing automation platforms (HubSpot, Marketo, etc.)',
    'Passion for technology, innovation, and building impactful campaigns at scale',
  ],
  benefits: [
    {
      icon: 'heart',
      title: 'Health & Wellness',
      description: 'Comprehensive medical, dental, and vision coverage for you and your family'
    },
    {
      icon: 'briefcase',
      title: 'Career Growth',
      description: 'Professional development programs and opportunities to work on cutting-edge projects'
    },
    {
      icon: 'home',
      title: 'Work-Life Balance',
      description: 'Flexible work arrangements and generous paid time off'
    },
    {
      icon: 'dollar-sign',
      title: 'Competitive Compensation',
      description: 'Industry-leading salary, equity, and performance bonuses'
    }
  ]
};

// Generate TIME_SLOTS dynamically — lock first 8 days from today, open from day 9+
function generateTimeSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const times = ['09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM'];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lockUntil = new Date(today);
  lockUntil.setDate(lockUntil.getDate() + 8); // first 8 days locked

  let id = 1;
  // Generate 20 days from today, skip weekends
  for (let d = 0; d < 30 && slots.length < 24; d++) {
    const day = new Date(today);
    day.setDate(day.getDate() + d);
    const dow = day.getDay();
    if (dow === 0 || dow === 6) continue; // skip weekends
    const dateStr = day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const available = day >= lockUntil;
    for (const t of times) {
      slots.push({ id: String(id++), date: dateStr, time: t, available });
    }
  }
  return slots;
}

export const TIME_SLOTS: TimeSlot[] = generateTimeSlots();