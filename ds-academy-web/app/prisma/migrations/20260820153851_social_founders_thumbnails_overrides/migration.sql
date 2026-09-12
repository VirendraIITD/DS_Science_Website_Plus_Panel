-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "directorDeskCtaHref" TEXT NOT NULL DEFAULT '/founders',
ADD COLUMN     "directorDeskCtaLabel" TEXT NOT NULL DEFAULT 'Meet our founders',
ADD COLUMN     "directorDeskEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "directorDeskHeading" TEXT NOT NULL DEFAULT 'From the Director''s Desk',
ADD COLUMN     "directorDeskNote" TEXT NOT NULL DEFAULT 'A short word from the people who built this place.',
ADD COLUMN     "directorDeskPhotoUrl" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "linkedinUrl" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "resultsStatJeeOverride" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "resultsStatNeetOverride" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "resultsStatTotalOverride" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "resultsStatYearsOverride" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "snapchatUrl" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "testimonials" ADD COLUMN     "thumbnailUrl" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "founders" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL DEFAULT '',
    "role" TEXT NOT NULL DEFAULT '',
    "quote" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "founders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "founders_order_idx" ON "founders"("order");
