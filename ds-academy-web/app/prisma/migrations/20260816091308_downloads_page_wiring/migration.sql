-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "downloadsAdmHeading" TEXT NOT NULL DEFAULT 'Solved the paper and want to check your score?',
ADD COLUMN     "downloadsAdmNote" TEXT NOT NULL DEFAULT 'Download the answer key, mark your own paper, and then come and talk to us about what the score actually means for your rank and your college. That conversation is free too.';

-- CreateTable
CREATE TABLE "download_highlights" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',
    "icon" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "download_highlights_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "download_highlights_order_idx" ON "download_highlights"("order");
