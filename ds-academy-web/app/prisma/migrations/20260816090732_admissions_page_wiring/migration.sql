-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "admissionsAdmHeading" TEXT NOT NULL DEFAULT 'Start with a free demo class.',
ADD COLUMN     "admissionsAdmNote" TEXT NOT NULL DEFAULT 'The honest way to decide is to sit in one. Attend a full session with the batch you are considering, watch how the teacher handles a doubt, then make up your mind. If it is not for you, we will say so ourselves.',
ADD COLUMN     "admissionsAdmPoints" TEXT[] DEFAULT ARRAY['A real class, not a sales demo', 'Parents can sit in', 'Free, and no obligation after', 'Fee and batch explained in the same visit']::TEXT[],
ADD COLUMN     "admissionsHeading" TEXT NOT NULL DEFAULT 'Admissions 2026-27 are open',
ADD COLUMN     "admissionsIntro" TEXT NOT NULL DEFAULT 'No entrance exam to get in, no donation, no capitation fee. Every batch is capped at 40 and seats go in the order admissions are confirmed — that is the only rush there is.',
ADD COLUMN     "admissionsStatFeeInstalments" TEXT NOT NULL DEFAULT '2 or 3',
ADD COLUMN     "admissionsStatSeatsPerBatch" TEXT NOT NULL DEFAULT '40',
ADD COLUMN     "admissionsWhatToBring" TEXT[] DEFAULT ARRAY['Last school marksheet (photocopy + original to show)', 'Aadhaar card of the student (photocopy)', 'Aadhaar card of a parent or guardian', 'Two passport-size photographs', 'Transfer certificate, if you have one', 'First fee instalment — cash, UPI or card']::TEXT[];

-- CreateTable
CREATE TABLE "eligibility_rows" (
    "id" TEXT NOT NULL,
    "batch" TEXT NOT NULL,
    "who" TEXT NOT NULL,
    "timing" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "eligibility_rows_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "eligibility_rows_order_idx" ON "eligibility_rows"("order");
