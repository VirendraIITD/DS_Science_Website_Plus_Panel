import type { Metadata } from 'next';

import { LeadForm } from '@/components/site/LeadForm';
import { EmptyState } from '@/components/site/Sections';
import { db } from '@/lib/db';
import { getSettings } from '@/lib/settings';

export const revalidate = 600;

export const metadata: Metadata = {
  title: 'Facilities',
  description: 'Classrooms, library, computer lab and doubt counter at DS Science Academy.',
  alternates: { canonical: '/facilities' },
};

export default async function FacilitiesPage() {
  const [facilities, courses, safety, settings] = await Promise.all([
    db.facility.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
    db.course.findMany({ where: { active: true }, select: { name: true }, orderBy: { order: 'asc' } }),
    db.safetyPoint.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
    getSettings(),
  ]);

  return (
    <>
      <div className="ds-phead">
        <div className="ds-wrap">
          <div className="crumb">Home &nbsp;›&nbsp; Facilities</div>
          <h1>Where you will actually study</h1>
          <p>
            No marble lobby, no glossy brochure shots. Just a clean building with rooms that seat
            forty, a library that stays open till eight, and a doubt counter that has somebody
            sitting at it.
          </p>
        </div>
      </div>

      <section className="ds-sec">
        <div className="container-ds">
          <div className="ds-head">
            <div>
              <h2 className="t">What is on campus</h2>
              <p className="st">Everything here exists. If something is under construction we say so rather than photograph it from an angle.</p>
            </div>
          </div>

          {facilities.length === 0 ? (
            <EmptyState icon="🏫" text="Facility details are being added." />
          ) : (
            <div className="ds-fagrid">
              {facilities.map((f) => (
                <div key={f.id} className="ds-facard">
                  <div className="im">
                    {f.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={f.imageUrl} alt={f.title} />
                    ) : (
                      'FACILITY PHOTO'
                    )}
                  </div>
                  <div className="b">
                    {f.icon ? <div className="ic2">{f.icon}</div> : null}
                    <h4>{f.title}</h4>
                    <p>{f.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="ds-sec alt">
        <div className="container-ds">
          <div className="ds-head">
            <div>
              <h2 className="t">For parents: what we do about safety</h2>
              <p className="st">
                Most of our students travel in from Gangapur City and the villages around it, and
                many of them are girls. This part is not decoration — it is the reason a lot of
                families choose us.
              </p>
            </div>
          </div>
          <div className="ds-wgrid">
            {safety.map((s) => (
              <div key={s.id} className="ds-wcard">
                <div className="ic">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ds-sec">
        <div className="container-ds">
          <div className="ds-head">
            <div>
              <h2 className="t">Coming from out of town?</h2>
              <p className="st">
                Students travel in daily from the surrounding towns and villages. Here is what
                usually works.
              </p>
            </div>
          </div>
          <div className="ds-2col">
            <div className="ds-wcard" style={{ padding: '25px' }}>
              <h3 style={{ fontSize: '16.5px', fontWeight: 800, color: 'var(--ds-navy)', marginBottom: '15px' }}>Daily travel</h3>
              <p style={{ fontSize: '13.5px', color: '#39435c', lineHeight: 1.65 }}>
                Tell us your bus or train timing at admission and we will help fit you into the batch
                that works with it, if a seat is free.
              </p>
            </div>
            <div className="ds-wcard" style={{ padding: '25px' }}>
              <h3 style={{ fontSize: '16.5px', fontWeight: 800, color: 'var(--ds-navy)', marginBottom: '15px' }}>Staying nearby</h3>
              <p style={{ fontSize: '13.5px', color: '#39435c', lineHeight: 1.65 }}>
                We keep a list of hostels and PGs we have actually visited — separate lists for boys
                and girls — and someone from the office will walk around with you on your first visit
                if you ask.
              </p>
            </div>
          </div>
          <div className="ds-note" style={{ marginTop: '22px' }}>
            <h4>⚠️ One honest thing</h4>
            <p>
              We do not run our own hostel, and we do not earn anything from the ones we recommend. If
              a hostel gives you a bad experience, tell us — we take it off the list.
            </p>
          </div>
        </div>
      </section>

      <section className="ds-adm">
        <div className="ds-wrap">
          <div>
            <h2>{settings.facilitiesAdmHeading}</h2>
            <p>{settings.facilitiesAdmNote}</p>
          </div>

          <LeadForm
            courses={courses.map((c) => c.name)}
            compact
            heading="Plan a campus visit"
            note="Tell us when, we will keep someone free to show you around."
          />
        </div>
      </section>
    </>
  );
}
