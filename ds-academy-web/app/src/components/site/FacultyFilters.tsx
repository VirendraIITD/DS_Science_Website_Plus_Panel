'use client';

import { useState } from 'react';

export type FacultyMember = {
  id: string;
  name: string;
  photoUrl: string;
  subject: string;
  qualification: string;
  experienceYears: number;
  bio: string;
};

export function FacultyGrid({ faculty }: { faculty: FacultyMember[] }) {
  const subjects = [...new Set(faculty.map((f) => f.subject))].sort();
  const [active, setActive] = useState('all');
  const shown = active === 'all' ? faculty : faculty.filter((f) => f.subject === active);

  return (
    <>
      <div className="ds-filters">
        <button type="button" className={active === 'all' ? 'on' : ''} onClick={() => setActive('all')}>
          ALL SUBJECTS
        </button>
        {subjects.map((s) => (
          <button key={s} type="button" className={active === s ? 'on' : ''} onClick={() => setActive(s)}>
            {s}
          </button>
        ))}
      </div>

      <div className="ds-fcgrid">
        {shown.map((f) => (
          <article key={f.id} className="ds-fbig">
            <div className="im3">
              {f.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.photoUrl} alt={f.name} />
              ) : null}
              {f.experienceYears > 0 ? <span className="yrs">{f.experienceYears} years</span> : null}
            </div>
            <div className="b2">
              <h4>{f.name}</h4>
              <div className="sb">{f.subject.toUpperCase()}</div>
              {f.qualification ? <div className="q2">{f.qualification}</div> : null}
              {f.bio ? <p>{f.bio}</p> : null}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
