-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "demoAdmHeading" TEXT NOT NULL DEFAULT 'See a class before you commit.',
ADD COLUMN     "demoAdmNote" TEXT NOT NULL DEFAULT 'This is the same offer we make every family — sit in one real class, then decide. Most parents tell us this is what actually convinced them, not the brochure.',
ADD COLUMN     "demoAdmPoints" TEXT[] DEFAULT ARRAY['Completely free, no obligation', 'Same class the batch attends — nothing staged', 'Confirmed the same day, usually within hours', 'Parents welcome to sit in']::TEXT[];

-- CreateTable
CREATE TABLE "demo_steps" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "demo_steps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "demo_steps_order_idx" ON "demo_steps"("order");
