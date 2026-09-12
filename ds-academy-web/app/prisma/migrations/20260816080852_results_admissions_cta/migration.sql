-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "resultsAdmHeading" TEXT NOT NULL DEFAULT 'Next year, your name could be on this page.',
ADD COLUMN     "resultsAdmNote" TEXT NOT NULL DEFAULT 'Admissions for 2026-27 are open. Batches are capped at 40 and they fill in the order admissions are confirmed. Leave your number and the office will call you back — usually the same day.';
