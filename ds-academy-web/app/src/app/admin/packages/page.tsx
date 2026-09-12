import { PackagesManager } from '@/components/admin/PackagesManager';
import { ProLocked } from '@/components/admin/ProLocked';
import { requirePermission } from '@/lib/auth';
import { db } from '@/lib/db';
import { moduleEnabled } from '@/lib/tier';

export const dynamic = 'force-dynamic';

export default async function PackagesPage() {
  if (!moduleEnabled('packages')) {
    return (
      <ProLocked
        title="Course Packages"
        blurb="Tiered pricing cards per course and class level — Recorded, Live and Test Series, each with its own features, price and discount."
      />
    );
  }

  await requirePermission('packages');

  const [packages, courses] = await Promise.all([
    db.coursePackage.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      include: { course: { select: { name: true } } },
    }),
    db.course.findMany({ where: { active: true }, select: { id: true, name: true }, orderBy: { order: 'asc' } }),
  ]);

  return <PackagesManager packages={JSON.parse(JSON.stringify(packages))} courses={courses} />;
}
