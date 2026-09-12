import { ResourceManager } from '@/components/admin/ResourceManager';
import type { Column, Field } from '@/components/admin/types';
import { requirePermission } from '@/lib/auth';
import { db } from '@/lib/db';
import { CLASS_LEVEL_LABEL, CATEGORY_LABEL } from '@/lib/format';
import { CLASS_LEVEL_OPTIONS, COURSE_CATEGORY_OPTIONS } from '@/lib/options';

export const dynamic = 'force-dynamic';

const fields: Field[] = [
  { name: 'name', label: 'Course name', type: 'text', placeholder: 'NEET-UG' },
  { name: 'category', label: 'Category', type: 'select', options: COURSE_CATEGORY_OPTIONS },
  { name: 'tagline', label: 'Short line', type: 'text', placeholder: 'Class 11 & 12', full: true },
  { name: 'classLevels', label: 'Class levels', type: 'multiselect', options: CLASS_LEVEL_OPTIONS, full: true },
  { name: 'description', label: 'Description', type: 'textarea', rows: 4, full: true },
  { name: 'highlights', label: 'Highlights', type: 'list', full: true, help: 'One per line — shown as ticks on the course page' },
  { name: 'imageUrl', label: 'Image', type: 'image', full: true, aspect: 4 / 3 },
  { name: 'slug', label: 'URL slug', type: 'text', help: 'Leave blank to build it from the name' },
  { name: 'order', label: 'Display order', type: 'number' },
  { name: 'active', label: 'Visible on website', type: 'checkbox', defaultValue: true },
];

const columns: Column[] = [
  { key: 'name', header: 'Course' },
  { key: 'category', header: 'Category', kind: 'pill', map: CATEGORY_LABEL },
  { key: 'classLevels', header: 'Levels', kind: 'chips', map: CLASS_LEVEL_LABEL },
  { key: 'slug', header: 'URL' },
  { key: 'order', header: 'Order' },
  { key: 'active', header: 'Live', kind: 'bool' },
];

export default async function CoursesPage() {
  await requirePermission('courses');
  const rows = await db.course.findMany({ orderBy: [{ order: 'asc' }, { name: 'asc' }] });

  return (
    <ResourceManager
      resource="courses"
      title="Courses & Exams"
      addLabel="Course"
      fields={fields}
      columns={columns}
      rows={rows as never}
      emptyHint="Add the courses you run. Each one gets its own page on the website."
    />
  );
}
