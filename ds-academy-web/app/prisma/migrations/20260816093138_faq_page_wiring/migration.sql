-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "faqAdmHeading" TEXT NOT NULL DEFAULT 'Got a question? Just ask.',
ADD COLUMN     "faqAdmNote" TEXT NOT NULL DEFAULT 'Not every question has an answer on the website. Leave your number — a counsellor will call and talk it through, and if our institute isn''t the right fit for your child, they''ll tell you that honestly too.';
