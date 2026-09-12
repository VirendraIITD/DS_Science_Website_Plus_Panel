import type { Metadata } from 'next';

import { DownloadsFilters } from '@/components/site/DownloadsFilters';
import { LeadForm } from '@/components/site/LeadForm';
import { EmptyState } from '@/components/site/Sections';
import { cachedQuery } from '@/lib/cache';
import { db } from '@/lib/db';
import { getSettings } from '@/lib/settings';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Downloads',
  description: 'Prospectus, syllabus and previous-year papers for NEET and JEE.',
  alternates: { canonical: '/downloads' },
};

const getDownloadsPageData = cachedQuery(
  ['downloads-page-data'],
  () =>
    Promise.all([
      db.download.findMany({ where: { active: true }, orderBy: { createdAt: 'desc' } }),
      db.course.findMany({ where: { active: true }, select: { name: true }, orderBy: { order: 'asc' } }),
      db.downloadHighlight.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
    ]),
  300,
);

export default async function DownloadsPage() {
  const [[files, courses, highlights], settings] = await Promise.all([getDownloadsPageData(), getSettings()]);

  const totalDownloads = files.reduce((s, f) => s + f.downloadsCount, 0);

  return (
    <>
      <div className="ds-phead">
        <div className="ds-wrap">
          <div className="crumb">Home &nbsp;›&nbsp; Downloads</div>
          <h1>Downloads &amp; answer keys</h1>
          <p>
            Prospectus, syllabus, past papers and our own solutions — all free, for everyone. You do
            not have to be our student to download any of this.
          </p>
          <div className="facts">
            <div>
              <b>{files.length}</b>
              <span>Files available</span>
            </div>
            {totalDownloads > 0 ? (
              <div>
                <b>{totalDownloads.toLocaleString('en-IN')}</b>
                <span>Downloads so far</span>
              </div>
            ) : null}
            <div>
              <b>Free</b>
              <span>No login, no form</span>
            </div>
          </div>
        </div>
      </div>

      <section className="ds-sec">
        <div className="container-ds">
          {files.length === 0 ? (
            <EmptyState icon="📥" text="Files are being uploaded." />
          ) : (
            <DownloadsFilters
              files={files.map((f) => ({
                id: f.id,
                title: f.title,
                category: f.category,
                fileUrl: f.fileUrl,
                fileSizeKb: f.fileSizeKb,
                downloadsCount: f.downloadsCount,
              }))}
            />
          )}
        </div>
      </section>

      <section className="ds-sec alt">
        <div className="container-ds">
          <div className="ds-head">
            <div>
              <h2 className="t">How we do this</h2>
              <p className="st">Nothing here is locked behind a form. Here is what to expect and when.</p>
            </div>
          </div>
          <div className="ds-wgrid">
            {highlights.map((h) => (
              <div key={h.id} className="ds-wcard">
                <div className="ic">{h.icon}</div>
                <h3>{h.title}</h3>
                <p>{h.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ds-adm">
        <div className="ds-wrap">
          <div>
            <h2>{settings.downloadsAdmHeading}</h2>
            <p>{settings.downloadsAdmNote}</p>
          </div>

          <LeadForm
            courses={courses.map((c) => c.name)}
            compact
            heading="Talk about your score"
            note="A counsellor will call and go through it with you."
          />
        </div>
      </section>
    </>
  );
}
