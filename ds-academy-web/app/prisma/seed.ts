/**
 * Seeds a usable starting point: the admin account, site settings, and the
 * sample content shown in the approved prototypes. Safe to re-run — every
 * write is an upsert keyed on something stable.
 *
 *   npm run db:seed
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

const slug = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

async function main() {
  // --- Admin account -------------------------------------------------------
  const email = (process.env.SEED_ADMIN_EMAIL || 'admin@dsscienceacademy.com').toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe@123';

  const admin = await db.adminUser.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: process.env.SEED_ADMIN_NAME || 'Administrator',
      role: 'SUPER_ADMIN',
      passwordHash: await bcrypt.hash(password, 12),
    },
  });
  console.log(`✓ admin: ${admin.email}`);

  // --- Site settings -------------------------------------------------------
  await db.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      instituteName: 'DS Science Academy',
      tagline: 'Trusted NEET, JEE & Foundation coaching — Gangapur City.',
      about:
        'DS Science Academy has been preparing students of Gangapur City for IIT-JEE, NEET and the Foundation years since its founding. Small batches, senior faculty in every subject, and a test-and-review cycle that leaves nothing to chance.',
      address: 'Near Bus Stand, Gangapur City, Rajasthan 322201',
      city: 'Gangapur City',
      state: 'Rajasthan',
      pincode: '322201',
      phones: ['+91 99999 99999'],
      emails: ['office@dsscienceacademy.com'],
      whatsappNumber: '919999999999',
      seoTitle: 'DS Science Academy — NEET, JEE & Foundation Coaching in Gangapur City',
      seoDescription:
        'Coaching for NEET, IIT-JEE and Foundation (Class 6–10) in Gangapur City, Rajasthan. Experienced faculty, regular tests, proven results.',
      seoKeywords:
        'NEET coaching Gangapur City, JEE coaching Gangapur City, best coaching Gangapur City, DS Science Academy',
      officeHours: '9:00 am – 7:00 pm, Monday to Saturday',
      demoIntro:
        'You attend an ordinary class — the same teacher, the same batch, the same pace. Nothing is put on for the occasion, because a demo that is not honest helps nobody.',
      demoParentNote:
        'Please do. Most of the questions that matter — fees, batch size, how tests are reviewed — get asked by parents, and they should hear the answers first-hand.',
      predictorNote:
        "How to read this. Colleges are grouped by comparing your rank against last year's closing rank for that college, category and quota. Safe means you were comfortably inside it, Moderate means you are around it, and Reach means you are past it but close enough to try. Cut-offs move every year with the number of candidates and seats, so treat this as a guide for filling choices — not a guarantee. Talk to our counsellors before you lock your list.",
    },
  });
  console.log('✓ site settings');

  // --- Home stats strip ----------------------------------------------------
  const stats = [
    { label: 'Active Students', value: '2,500', icon: '👨‍🎓', order: 1 },
    { label: 'Selections', value: '184', icon: '🏆', order: 2 },
    { label: 'Years of Teaching', value: '12+', icon: '📅', order: 3 },
    { label: 'Faculty Members', value: '24', icon: '👨‍🏫', order: 4 },
  ];
  for (const s of stats) {
    const found = await db.statItem.findFirst({ where: { label: s.label } });
    if (!found) await db.statItem.create({ data: s });
  }

  // --- Why choose us -------------------------------------------------------
  const why = [
    {
      title: 'Senior faculty in every subject',
      body: 'Physics, Chemistry, Biology and Maths are each led by a teacher with a decade or more in the classroom.',
      icon: '👨‍🏫',
      order: 1,
    },
    {
      title: 'Batches capped at 40',
      body: 'Small enough that every student gets asked a question, and gets an answer.',
      icon: '👥',
      order: 2,
    },
    {
      title: 'Weekly tests, same week review',
      body: 'A test is only useful if the mistakes are discussed. Ours are, every week.',
      icon: '📝',
      order: 3,
    },
    {
      title: 'Doubt counter open all day',
      body: 'Walk in between classes — no appointment, no waiting for the next session.',
      icon: '💬',
      order: 4,
    },
    {
      title: 'Printed material, not photocopies',
      body: 'Modules, DPPs and PYQ books included with the fee.',
      icon: '📚',
      order: 5,
    },
    {
      title: 'Parent updates every month',
      body: 'Attendance and test performance shared with parents, on paper and on WhatsApp.',
      icon: '📞',
      order: 6,
    },
  ];
  for (const w of why) {
    const found = await db.whyPoint.findFirst({ where: { title: w.title } });
    if (!found) await db.whyPoint.create({ data: w });
  }

  // --- Admissions page steps -------------------------------------------------
  const admissionSteps = [
    {
      title: 'Enquire or walk in',
      body: 'Fill the form here, or come to the centre between 9 am and 7 pm. Bring the last report card if you have it.',
      order: 1,
    },
    {
      title: 'Counselling session',
      body: 'We look at the marks, the target exam and the time left, then suggest the batch that actually fits.',
      order: 2,
    },
    {
      title: 'Scholarship test (optional)',
      body: 'Sit the test to qualify for a fee waiver. It is free and takes about two hours.',
      order: 3,
    },
    {
      title: 'Confirm the seat',
      body: 'Pay the first instalment and collect the study material. Batches are capped at 40, so seats go early.',
      order: 4,
    },
  ];
  for (const s of admissionSteps) {
    const found = await db.admissionStep.findFirst({ where: { title: s.title } });
    if (!found) await db.admissionStep.create({ data: s });
  }

  // --- Demo page "what to expect" checklist ---------------------------------
  const demoHighlights = [
    { text: 'Pick online or at the centre, whichever is easier.', order: 1 },
    { text: 'Bring a notebook. You will want to write things down.', order: 2 },
    { text: 'Stay back afterwards and ask the teacher whatever you like.', order: 3 },
    { text: 'We will call to confirm the slot before the day.', order: 4 },
  ];
  for (const h of demoHighlights) {
    const found = await db.demoHighlight.findFirst({ where: { text: h.text } });
    if (!found) await db.demoHighlight.create({ data: h });
  }

  // --- Courses -------------------------------------------------------------
  const courses = [
    {
      name: 'NEET-UG',
      category: 'NEET' as const,
      classLevels: ['CLASS_11', 'CLASS_12', 'DROPPER'] as const,
      tagline: 'Class 11, 12 & Droppers',
      description:
        'A full NEET programme covering Physics, Chemistry and Biology from the NCERT base upward, with weekly tests on the NTA pattern and a dedicated Biology doubt counter.',
      highlights: [
        'NCERT-anchored teaching, line by line',
        'Weekly NTA-pattern tests with OMR',
        'Separate Biology doubt counter',
        'Printed modules + DPP + 10-year PYQ book',
      ],
      order: 1,
    },
    {
      name: 'IIT-JEE (Main + Advanced)',
      category: 'JEE' as const,
      classLevels: ['CLASS_11', 'CLASS_12', 'DROPPER'] as const,
      tagline: 'Class 11, 12 & Droppers',
      description:
        'Mains and Advanced prepared together, with the problem-solving depth Advanced needs and the speed practice Mains rewards.',
      highlights: [
        'Mains and Advanced taught in one track',
        'Fortnightly Advanced-level problem sessions',
        'CBT mock tests in the computer lab',
        'Printed modules + DPP + PYQ book',
      ],
      order: 2,
    },
    {
      name: 'Foundation (Class 6–10)',
      category: 'FOUNDATION' as const,
      classLevels: ['FOUNDATION'] as const,
      tagline: 'Pre-foundation groundwork',
      description:
        'School syllabus strengthened alongside early Olympiad and NTSE-style reasoning, so Class 11 does not arrive as a shock.',
      highlights: [
        'School syllabus + Olympiad reasoning',
        'Science and Maths by subject specialists',
        'Monthly parent-teacher meeting',
        'Handwriting and presentation practice',
      ],
      order: 3,
    },
    {
      name: 'Board (CBSE / RBSE)',
      category: 'BOARD' as const,
      classLevels: ['CLASS_11', 'CLASS_12'] as const,
      tagline: 'Class 11 & 12 board preparation',
      description:
        'Board-focused revision running alongside the competitive track, with full-length paper practice before the exams.',
      highlights: ['Chapter-wise board question practice', 'Full-length pre-board papers', 'Answer-writing drills'],
      order: 4,
    },
  ];

  for (const c of courses) {
    await db.course.upsert({
      where: { slug: slug(c.name) },
      update: {},
      create: { ...c, slug: slug(c.name), classLevels: [...c.classLevels] },
    });
  }
  console.log('✓ courses');

  // --- Toppers (from the prototype table) ----------------------------------
  const toppers = [
    { name: 'Ananya Singh', exam: 'NEET', rankOrScore: 'AIR 342', year: 2025, order: 1, featured: true,
      quote: 'The weekly tests made the real paper feel like just another Sunday.' },
    { name: 'Vivaan Mehta', exam: 'JEE Advanced', rankOrScore: 'AIR 1,208', year: 2025, order: 2, featured: true,
      quote: 'Two years of DPPs is what got me through Advanced.' },
    { name: 'Ishita Jain', exam: 'NEET', rankOrScore: '685 / 720', year: 2025, order: 3, featured: true },
    { name: 'Kabir Nair', exam: 'JEE Main', rankOrScore: '99.4 %ile', year: 2024, order: 4, featured: true },
    { name: 'Ritika Sharma', exam: 'NEET', rankOrScore: 'AIR 1,905', year: 2024, order: 5 },
    { name: 'Aditya Meena', exam: 'JEE Main', rankOrScore: '98.7 %ile', year: 2024, order: 6 },
  ];
  for (const t of toppers) {
    const found = await db.topper.findFirst({ where: { name: t.name, year: t.year } });
    if (!found) await db.topper.create({ data: t });
  }
  console.log('✓ toppers');

  // --- Faculty (from the prototype cards) ----------------------------------
  const faculty = [
    { name: 'Dr. R. Sharma', subject: 'Physics', experienceYears: 12, qualification: 'M.Sc., Ph.D. (Physics)', order: 1 },
    { name: 'Ms. A. Kapoor', subject: 'Chemistry', experienceYears: 9, qualification: 'M.Sc. (Chemistry)', order: 2 },
    { name: 'Mr. S. Yadav', subject: 'Biology', experienceYears: 15, qualification: 'M.Sc. (Botany)', order: 3 },
    { name: 'Mr. M. Pareek', subject: 'Organic Chemistry', experienceYears: 10, qualification: 'M.Sc. (Organic Chemistry)', order: 4 },
    { name: 'Mr. V. Gupta', subject: 'Mathematics', experienceYears: 11, qualification: 'M.Sc. (Mathematics)', order: 5 },
    { name: 'Ms. P. Jain', subject: 'Zoology', experienceYears: 7, qualification: 'M.Sc. (Zoology)', order: 6 },
  ];
  for (const f of faculty) {
    const found = await db.faculty.findFirst({ where: { name: f.name } });
    if (!found) await db.faculty.create({ data: f });
  }
  console.log('✓ faculty');

  // --- News ----------------------------------------------------------------
  const news = [
    { title: 'Admissions Open 2026-27', type: 'NOTICE' as const, status: 'PUBLISHED' as const, pinned: true,
      body: 'Admissions for the 2026-27 session are open for NEET, IIT-JEE and Foundation batches. Seats are limited to 40 per batch. Visit the centre or fill the enquiry form and we will call you back.' },
    { title: 'Scholarship Test — 10 August', type: 'EVENT' as const, status: 'PUBLISHED' as const,
      body: 'The annual scholarship test will be held on 10 August at the main campus. Up to 100% fee waiver for the top performers. Registration is free.' },
    { title: 'NEET 2025 Result Highlights', type: 'NOTICE' as const, status: 'PUBLISHED' as const,
      body: 'Our best NEET result so far, led by Ananya Singh at AIR 342. Congratulations to every student and their families.' },
  ];
  for (const n of news) {
    await db.news.upsert({ where: { slug: slug(n.title) }, update: {}, create: { ...n, slug: slug(n.title) } });
  }

  // --- Downloads (titles from the prototype) -------------------------------
  const downloads = [
    { title: 'Prospectus / Brochure 2026-27', category: 'BROCHURE' as const, fileUrl: '/uploads/sample/prospectus.pdf', downloadsCount: 1204 },
    { title: 'JEE Syllabus (Class 11–12)', category: 'SYLLABUS' as const, fileUrl: '/uploads/sample/jee-syllabus.pdf', downloadsCount: 842 },
    { title: 'NEET Syllabus', category: 'SYLLABUS' as const, fileUrl: '/uploads/sample/neet-syllabus.pdf', downloadsCount: 931 },
    { title: 'JEE 2025 Paper + Solutions', category: 'PYQ' as const, fileUrl: '/uploads/sample/jee-2025.pdf', downloadsCount: 2110 },
    { title: 'NEET 2025 Paper + Answer Key', category: 'PYQ' as const, fileUrl: '/uploads/sample/neet-2025.pdf', downloadsCount: 2845 },
  ];
  for (const d of downloads) {
    const found = await db.download.findFirst({ where: { title: d.title } });
    if (!found) await db.download.create({ data: d });
  }

  // --- Banners -------------------------------------------------------------
  const banners = [
    { title: 'NEET 2025 — Record Results', subtitle: 'Led by AIR 342. See the full list of selections.', link: '/results', ctaLabel: 'View results', order: 1, status: 'LIVE' as const },
    { title: 'Admissions Open 2026-27', subtitle: 'NEET · IIT-JEE · Foundation. Batches capped at 40.', link: '/admissions', ctaLabel: 'Apply now', order: 2, status: 'LIVE' as const },
    { title: 'Scholarship Test — 10 August', subtitle: 'Up to 100% fee waiver. Registration is free.', link: '/news', ctaLabel: 'Read more', order: 3, status: 'HIDDEN' as const },
  ];
  for (const b of banners) {
    const found = await db.banner.findFirst({ where: { title: b.title } });
    if (!found) await db.banner.create({ data: b });
  }

  // --- Facilities ----------------------------------------------------------
  const facilities = [
    { title: 'Air-conditioned classrooms', description: 'Every room seats 40, with a clear board line from the back bench.', icon: '🏫', order: 1 },
    { title: 'Library & reading room', description: 'Open from 8 am to 8 pm, including the days there are no classes.', icon: '📖', order: 2 },
    { title: 'Computer lab for CBT mocks', description: 'Mock tests run on the same interface as the real CBT exam.', icon: '💻', order: 3 },
    { title: 'Doubt counter', description: 'Staffed through the day — walk in between classes.', icon: '💬', order: 4 },
    { title: 'Separate girls’ common room', description: 'With a dedicated attendant.', icon: '🚻', order: 5 },
    { title: 'Hostel guidance', description: 'We help outstation families find vetted hostels and PGs nearby.', icon: '🛏️', order: 6 },
  ];
  for (const f of facilities) {
    const found = await db.facility.findFirst({ where: { title: f.title } });
    if (!found) await db.facility.create({ data: f });
  }

  // --- Testimonials --------------------------------------------------------
  const testimonials = [
    { name: 'Ananya Singh', role: 'NEET 2025 · AIR 342', quote: 'The weekly test and the same-week review is what actually moved my score. Nothing stayed unexplained for long.', order: 1 },
    { name: 'Sunita Gupta', role: 'Parent, Class 10', quote: 'Every month we get the attendance and test report without having to ask. That matters to us.', order: 2 },
    { name: 'Vivaan Mehta', role: 'JEE Advanced 2025 · AIR 1,208', quote: 'Two years of daily practice sheets. That is the whole secret.', order: 3 },
  ];
  for (const t of testimonials) {
    const found = await db.testimonial.findFirst({ where: { name: t.name, quote: t.quote } });
    if (!found) await db.testimonial.create({ data: t });
  }

  console.log('✓ content');

  // --- [PRO] -------------------------------------------------------------
  const main = await db.branch.findFirst({ where: { name: 'Main Campus' } });
  if (!main) {
    await db.branch.createMany({
      data: [
        { name: 'Main Campus', city: 'Gangapur City', address: 'Near Bus Stand, Gangapur City, Rajasthan 322201', phone: '+91 99999 99999', studentsCount: 1800, isMain: true, status: 'ACTIVE', order: 1 },
        { name: 'City Centre', city: 'Gangapur City', address: 'Station Road, Gangapur City, Rajasthan', phone: '+91 99999 99998', studentsCount: 700, status: 'ACTIVE', order: 2 },
        { name: 'New Branch', city: 'Sawai Madhopur', address: 'Sawai Madhopur, Rajasthan', studentsCount: 0, status: 'SETUP', order: 3 },
      ],
    });
  }

  const neet = await db.course.findUnique({ where: { slug: slug('NEET-UG') } });
  const jee = await db.course.findUnique({ where: { slug: slug('IIT-JEE (Main + Advanced)') } });

  if (neet && jee) {
    const packages = [
      { courseId: neet.id, title: 'NEET Achiever 11', type: 'RECORDED' as const, classLevel: 'CLASS_11' as const,
        durationLabel: 'Starts 1 Aug 2026',
        features: ['1250+ recorded lectures', '25+ tests (CBT + Pen)', 'Study material included'],
        priceOriginal: 24999, priceDiscounted: 19999, discountPct: 20, order: 1 },
      { courseId: jee.id, title: 'JEE Live Intensive 11', type: 'LIVE' as const, classLevel: 'CLASS_11' as const,
        durationLabel: 'Starts 5 Aug 2026',
        features: ['Live daily classes', 'Doubt sessions + tests', 'Recorded backup'],
        priceOriginal: 39999, priceDiscounted: 31999, discountPct: 20, highlight: true, order: 2 },
      { courseId: neet.id, title: 'NEET Test Series', type: 'TEST_SERIES' as const, classLevel: 'CLASS_12' as const,
        durationLabel: 'Rolling',
        features: ['40+ full + part tests', 'All-India rank', 'Detailed analysis'],
        priceOriginal: 5999, priceDiscounted: 4499, discountPct: 25, order: 3 },
      { courseId: neet.id, title: 'NEET Dropper Repeater', type: 'LIVE' as const, classLevel: 'DROPPER' as const,
        durationLabel: 'Starts 20 Jun 2026',
        features: ['Full syllabus from scratch', 'Daily 6-hour schedule', 'Weekly full tests'],
        priceOriginal: 44999, priceDiscounted: 34999, discountPct: 22, order: 4 },
    ];
    for (const p of packages) {
      const found = await db.coursePackage.findFirst({ where: { title: p.title } });
      if (!found) await db.coursePackage.create({ data: p });
    }
  }

  const faqs = [
    { question: 'What courses does DS Science Academy offer?', answer: 'NEET-UG, IIT-JEE (Main + Advanced), Foundation for Class 6–10, and board preparation for CBSE and RBSE.', order: 1 },
    { question: 'When do the new batches start?', answer: 'Class 11 and 12 batches begin in the first week of August. Dropper batches start in late June. Foundation batches start in April.', order: 2 },
    { question: 'Is there a scholarship test?', answer: 'Yes. The annual scholarship test is held in August and offers up to a 100% fee waiver. Registration is free.', order: 3 },
    { question: 'Do you provide hostel facility?', answer: 'We do not run a hostel ourselves, but we help outstation families find vetted hostels and PGs close to the campus.', order: 4 },
    { question: 'How big are the batches?', answer: 'Every batch is capped at 40 students.', order: 5 },
    { question: 'Are the fees payable in instalments?', answer: 'Yes. Fees can be paid in two or three instalments. Talk to the front office for the schedule.', order: 6 },
  ];
  for (const f of faqs) {
    const found = await db.faq.findFirst({ where: { question: f.question } });
    if (!found) await db.faq.create({ data: f });
  }

  const posts = [
    { title: 'How to crack NEET in one year', category: 'NEET', status: 'PUBLISHED' as const, publishedAt: new Date(),
      excerpt: 'A one-year plan that assumes nothing except that you are willing to sit down every day.',
      body: 'A one-year NEET attempt is won on consistency, not intensity.\n\nStart with NCERT Biology, front to back, and do not move on until you can answer a question from any line of it. Physics needs a problem a day from the first week. Chemistry splits into three habits: learn Inorganic by revision, Organic by mechanism, Physical by practice.\n\nBook a weekly full-length test from month three. The point is not the score — it is the review that follows.' },
    { title: 'JEE Main 2027 — what the pattern change means', category: 'JEE', status: 'DRAFT' as const,
      excerpt: 'Reading the notification carefully, and what it changes about how you prepare.',
      body: 'Draft.' },
  ];
  for (const p of posts) {
    await db.blogPost.upsert({ where: { slug: slug(p.title) }, update: {}, create: { ...p, slug: slug(p.title) } });
  }

  // Sample cutoffs so the predictor has something to answer with. Replace
  // these with the real published data from Admin › Rank Predictor.
  const cutoffCount = await db.predictorCutoff.count();
  if (cutoffCount === 0) {
    await db.predictorCutoff.createMany({
      data: [
        { exam: 'NEET', college: 'AIIMS New Delhi', state: 'Delhi', category: 'General', quota: 'All India', closingRank: 60, year: 2025 },
        { exam: 'NEET', college: 'Maulana Azad Medical College, Delhi', state: 'Delhi', category: 'General', quota: 'All India', closingRank: 180, year: 2025 },
        { exam: 'NEET', college: 'AIIMS Jodhpur', state: 'Rajasthan', category: 'General', quota: 'All India', closingRank: 1450, year: 2025 },
        { exam: 'NEET', college: 'SMS Medical College, Jaipur', state: 'Rajasthan', category: 'General', quota: 'All India', closingRank: 9800, year: 2025 },
        { exam: 'NEET', college: 'Govt. Medical College, Kota', state: 'Rajasthan', category: 'General', quota: 'All India', closingRank: 16500, year: 2025 },
        { exam: 'NEET', college: 'Govt. Medical College, Bharatpur', state: 'Rajasthan', category: 'General', quota: 'State', closingRank: 24000, year: 2025 },
        { exam: 'NEET', college: 'RUHS College of Medical Sciences, Jaipur', state: 'Rajasthan', category: 'General', quota: 'State', closingRank: 31000, year: 2025 },
        { exam: 'NEET', college: 'Jhalawar Medical College', state: 'Rajasthan', category: 'General', quota: 'State', closingRank: 38500, year: 2025 },
        { exam: 'NEET', college: 'SMS Medical College, Jaipur', state: 'Rajasthan', category: 'OBC', quota: 'All India', closingRank: 14200, year: 2025 },
        { exam: 'NEET', college: 'Govt. Medical College, Kota', state: 'Rajasthan', category: 'OBC', quota: 'All India', closingRank: 22800, year: 2025 },
        { exam: 'NEET', college: 'SMS Medical College, Jaipur', state: 'Rajasthan', category: 'SC', quota: 'All India', closingRank: 42000, year: 2025 },
        { exam: 'NEET', college: 'Govt. Medical College, Kota', state: 'Rajasthan', category: 'SC', quota: 'All India', closingRank: 58000, year: 2025 },
        { exam: 'JEE', college: 'IIT Bombay', courseName: 'Computer Science', state: 'Maharashtra', category: 'General', quota: 'All India', closingRank: 68, year: 2025 },
        { exam: 'JEE', college: 'IIT Delhi', courseName: 'Computer Science', state: 'Delhi', category: 'General', quota: 'All India', closingRank: 118, year: 2025 },
        { exam: 'JEE', college: 'IIT Jodhpur', courseName: 'Computer Science', state: 'Rajasthan', category: 'General', quota: 'All India', closingRank: 2400, year: 2025 },
        { exam: 'JEE', college: 'MNIT Jaipur', courseName: 'Computer Science', state: 'Rajasthan', category: 'General', quota: 'All India', closingRank: 4200, year: 2025 },
        { exam: 'JEE', college: 'MNIT Jaipur', courseName: 'Mechanical', state: 'Rajasthan', category: 'General', quota: 'All India', closingRank: 12800, year: 2025 },
        { exam: 'JEE', college: 'IIIT Kota', courseName: 'Computer Science', state: 'Rajasthan', category: 'General', quota: 'All India', closingRank: 18600, year: 2025 },
      ],
    });
  }

  console.log('✓ pro sample data');
  console.log('\nSeed complete.');
  console.log(`  Sign in at /admin/login as ${email}`);
  if (!process.env.SEED_ADMIN_PASSWORD) {
    console.log('  Password: ChangeMe@123  ← change this after the first login.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
