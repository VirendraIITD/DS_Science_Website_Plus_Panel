-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "offerPopupCtaHref" TEXT NOT NULL DEFAULT '/admissions',
ADD COLUMN     "offerPopupCtaLabel" TEXT NOT NULL DEFAULT 'Enrol Now',
ADD COLUMN     "offerPopupDiscount" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "offerPopupEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "offerPopupExpiry" TIMESTAMP(3),
ADD COLUMN     "offerPopupHeadline" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "offerPopupKicker" TEXT NOT NULL DEFAULT 'ALLEN ONLINE',
ADD COLUMN     "offerPopupNote" TEXT NOT NULL DEFAULT '';
