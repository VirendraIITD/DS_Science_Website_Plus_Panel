-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "starsCtaHref" TEXT NOT NULL DEFAULT '/gallery',
ADD COLUMN     "starsCtaLabel" TEXT NOT NULL DEFAULT 'Watch Videos',
ADD COLUMN     "starsHeading" TEXT NOT NULL DEFAULT 'DS Stars',
ADD COLUMN     "starsSubheading" TEXT NOT NULL DEFAULT 'Uncover the Journey to Rise and Shine';

-- AlterTable
ALTER TABLE "toppers" ADD COLUMN     "storyTag" TEXT NOT NULL DEFAULT '';
