-- CreateTable
CREATE TABLE "sample_test_faqs" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "sample_test_faqs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sample_test_faqs_order_idx" ON "sample_test_faqs"("order");
