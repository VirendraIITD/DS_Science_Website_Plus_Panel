-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "careersAdmHeading" TEXT NOT NULL DEFAULT 'Become part of the team.',
ADD COLUMN     "careersAdmNote" TEXT NOT NULL DEFAULT 'Whether you''re experienced faculty or just starting out — if you enjoy working with children, we''d like to talk. Send your resume below, or email it directly.',
ADD COLUMN     "careersAdmPoints" TEXT[] DEFAULT ARRAY['Every application gets a reply', 'No application fee', 'Screening call within 3-4 days', 'Resume: careers@dsscienceacademy.com']::TEXT[],
ADD COLUMN     "careersStatSince" TEXT NOT NULL DEFAULT '2014',
ADD COLUMN     "careersStatTeamSize" TEXT NOT NULL DEFAULT '18+';

-- CreateTable
CREATE TABLE "job_openings" (
    "id" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "department" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL DEFAULT 'Full-time',
    "experience" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT '',
    "seatClass" TEXT NOT NULL DEFAULT 'ok',
    "filled" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "job_openings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_reasons" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',
    "icon" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "career_reasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_steps" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "career_steps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "job_openings_order_idx" ON "job_openings"("order");

-- CreateIndex
CREATE INDEX "career_reasons_order_idx" ON "career_reasons"("order");

-- CreateIndex
CREATE INDEX "career_steps_order_idx" ON "career_steps"("order");
