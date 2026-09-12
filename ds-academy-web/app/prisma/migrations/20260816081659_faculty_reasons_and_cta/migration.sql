-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "facultyAdmHeading" TEXT NOT NULL DEFAULT 'Meet them before you decide.',
ADD COLUMN     "facultyAdmNote" TEXT NOT NULL DEFAULT 'Book a free demo class and sit through a real session with the teacher who would be taking your batch. Ask whatever you want afterwards. No fee, no obligation, no sales pitch.',
ADD COLUMN     "facultyAdmPoints" TEXT[] DEFAULT ARRAY['Attend a full class, not a trial lecture', 'Meet the subject teacher in person', 'Parents are welcome to sit in', 'Decide after, not before']::TEXT[],
ADD COLUMN     "facultyStatStudentsPerTeacher" TEXT NOT NULL DEFAULT '40';

-- CreateTable
CREATE TABLE "faculty_reasons" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',
    "icon" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "faculty_reasons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "faculty_reasons_order_idx" ON "faculty_reasons"("order");
