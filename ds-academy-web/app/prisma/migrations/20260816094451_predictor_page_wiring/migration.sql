-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "predictorAdmHeading" TEXT NOT NULL DEFAULT 'Want the full picture?',
ADD COLUMN     "predictorAdmNote" TEXT NOT NULL DEFAULT 'A rank-to-college estimate is just the start. Our counsellors walk you through every round, every quota and every backup option — the same way we do for our own students.',
ADD COLUMN     "predictorAdmPoints" TEXT[] DEFAULT ARRAY['Round-wise college & branch list', 'State quota + All-India quota explained', 'Choice-filling help, not just a prediction', 'Free first counselling call']::TEXT[];

-- CreateTable
CREATE TABLE "predictor_faqs" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "predictor_faqs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "predictor_faqs_order_idx" ON "predictor_faqs"("order");
