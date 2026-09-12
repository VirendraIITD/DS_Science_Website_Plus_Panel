'use client';

import { useState } from 'react';

import { CourseCards, type CourseCard } from '@/components/site/Sections';

const FILTERS: { key: string; label: string; category?: string }[] = [
  { key: 'all', label: 'ALL COURSES' },
  { key: 'neet', label: 'NEET', category: 'NEET' },
  { key: 'jee', label: 'JEE', category: 'JEE' },
  { key: 'foundation', label: 'Foundation', category: 'FOUNDATION' },
  { key: 'board', label: 'Board', category: 'BOARD' },
];

export function FilterableCourseGrid({ courses }: { courses: CourseCard[] }) {
  const [active, setActive] = useState('all');
  const filter = FILTERS.find((f) => f.key === active);
  const shown = filter?.category ? courses.filter((c) => c.category === filter.category) : courses;

  return (
    <>
      <div className="ds-filters">
        {FILTERS.map((f) => (
          <button key={f.key} type="button" className={active === f.key ? 'on' : ''} onClick={() => setActive(f.key)}>
            {f.label}
          </button>
        ))}
      </div>
      <CourseCards courses={shown} wide />
    </>
  );
}
