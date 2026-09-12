-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "coursesCtaHeading" TEXT NOT NULL DEFAULT 'Still not sure which one?',
ADD COLUMN     "coursesCtaNote" TEXT NOT NULL DEFAULT 'Come and sit through a free demo class. Attend the batch you are considering, meet the teacher, and decide after — not before. No fee, no obligation.',
ADD COLUMN     "coursesCtaPoints" TEXT[] DEFAULT ARRAY['Free demo class, any batch', 'Honest advice, even if it is "wait a year"', 'Scholarship test — up to 100% fee waiver', 'Sibling discount of 10% on the second admission']::TEXT[],
ADD COLUMN     "coursesIncludePoints" TEXT[] DEFAULT ARRAY['Printed modules for every subject', 'Daily Practice Sheets (DPP)', 'Previous year question book', 'Weekly tests with detailed analysis', 'Doubt counter, open all day', 'Monthly parent report', 'Library & reading room, 8 am – 8 pm', 'Fees payable in 2 or 3 instalments']::TEXT[],
ADD COLUMN     "coursesStatBatchSize" TEXT NOT NULL DEFAULT '40',
ADD COLUMN     "coursesStatEnrolled" TEXT NOT NULL DEFAULT '2,500+',
ADD COLUMN     "coursesStatSelections" TEXT NOT NULL DEFAULT '184';

-- CreateTable
CREATE TABLE "course_fit_rows" (
    "id" TEXT NOT NULL,
    "who" TEXT NOT NULL,
    "take" TEXT NOT NULL,
    "starts" TEXT NOT NULL DEFAULT '',
    "duration" TEXT NOT NULL DEFAULT '',
    "fee" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_fit_rows_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "course_fit_rows_order_idx" ON "course_fit_rows"("order");
