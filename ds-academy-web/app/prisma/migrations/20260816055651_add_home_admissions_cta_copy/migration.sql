-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "admHeading" TEXT NOT NULL DEFAULT 'Admissions are open for 2026-27',
ADD COLUMN     "admNote" TEXT NOT NULL DEFAULT 'Leave your number and someone from the office will call you back — usually the same day. You can also simply walk in; the front desk is open 9 am to 7 pm.',
ADD COLUMN     "admPoints" TEXT[] DEFAULT ARRAY['Free demo class before you decide', 'Fees payable in 2 or 3 instalments', 'Scholarship test — up to 100% fee waiver', 'Hostel & PG guidance for outstation families']::TEXT[];
