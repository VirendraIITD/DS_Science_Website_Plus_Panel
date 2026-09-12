import type { Metadata } from 'next';

import { LeadForm } from '@/components/site/LeadForm';
import { GalleryGrid } from '@/components/site/GalleryGrid';
import { EmptyState } from '@/components/site/Sections';
import { cachedQuery } from '@/lib/cache';
import { db } from '@/lib/db';
import { getSettings } from '@/lib/settings';

export const revalidate = 600;

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'Photos from the campus, classrooms, events and result celebrations.',
  alternates: { canonical: '/gallery' },
};

const getGalleryPageData = cachedQuery(
  ['gallery-page-data'],
  () =>
    Promise.all([
      db.galleryItem.findMany({
        where: { active: true },
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      }),
      db.course.findMany({ where: { active: true }, select: { name: true }, orderBy: { order: 'asc' } }),
    ]),
  600,
);

export default async function GalleryPage() {
  const [[allItems, courses], settings] = await Promise.all([getGalleryPageData(), getSettings()]);

  const photos = allItems.filter((i) => !i.youtubeId);
  const videos = allItems.filter((i) => i.youtubeId);
  const albums = [...new Set(photos.map((i) => i.album))].sort();

  return (
    <>
      <div className="ds-phead">
        <div className="ds-wrap">
          <div className="crumb">Home &nbsp;›&nbsp; Gallery</div>
          <h1>A year at DS, in photographs</h1>
          <p>
            Classrooms on an ordinary day, the Sunday test hall, felicitation day, and the trips
            everyone still talks about. Click any photo to see it properly.
          </p>
          <div className="facts">
            <div>
              <b>{albums.length}</b>
              <span>Albums</span>
            </div>
            <div>
              <b>{photos.length}</b>
              <span>Photos here</span>
            </div>
          </div>
        </div>
      </div>

      <section className="ds-sec">
        <div className="container-ds">
          {photos.length === 0 ? (
            <EmptyState icon="🖼️" text="Photos are being added to the gallery." />
          ) : (
            <GalleryGrid
              items={photos.map((i) => ({ id: i.id, imageUrl: i.imageUrl, caption: i.caption, album: i.album }))}
              albums={albums}
            />
          )}
        </div>
      </section>

      {videos.length > 0 ? (
        <section className="ds-sec alt">
          <div className="container-ds">
            <div className="ds-head">
              <div>
                <h2 className="t">Videos</h2>
                <p className="st">Topper interviews, a walk through the campus, and full classes.</p>
              </div>
            </div>
            <div className="ds-cgrid">
              {videos.map((v) => (
                <div key={v.id} className="ds-ccard">
                  <div style={{ aspectRatio: '16 / 9' }}>
                    <iframe
                      style={{ width: '100%', height: '100%', border: 0 }}
                      src={`https://www.youtube-nocookie.com/embed/${v.youtubeId}`}
                      title={v.caption || v.album}
                      loading="lazy"
                      allowFullScreen
                    />
                  </div>
                  {v.caption ? (
                    <div className="body">
                      <h3 style={{ fontSize: '15px' }}>{v.caption}</h3>
                      <div className="meta">{v.album}</div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="ds-adm">
        <div className="ds-wrap">
          <div>
            <h2>{settings.galleryAdmHeading}</h2>
            <p>{settings.galleryAdmNote}</p>
          </div>

          <LeadForm
            courses={courses.map((c) => c.name)}
            compact
            heading="Plan a campus visit"
            note="Tell us when, we will keep someone free."
          />
        </div>
      </section>
    </>
  );
}
