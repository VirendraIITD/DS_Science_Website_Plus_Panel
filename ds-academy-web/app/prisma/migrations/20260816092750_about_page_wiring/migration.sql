-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "aboutAdmHeading" TEXT NOT NULL DEFAULT 'Come and check for yourself.',
ADD COLUMN     "aboutAdmNote" TEXT NOT NULL DEFAULT 'Everything on this page is easy to claim and easy to verify. Walk in, ask to see a classroom mid-class, talk to a student who is not being supervised, ask the office for last year''s result list. We would rather you checked.',
ADD COLUMN     "aboutAdmPoints" TEXT[] DEFAULT ARRAY['Free demo class, any batch', 'Meet the teacher who would take your batch', 'Ask for the full result list — we will hand it over', 'No pressure to decide on the day']::TEXT[];
