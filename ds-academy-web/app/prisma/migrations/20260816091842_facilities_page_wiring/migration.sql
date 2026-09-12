-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "facilitiesAdmHeading" TEXT NOT NULL DEFAULT 'Photos only say so much.',
ADD COLUMN     "facilitiesAdmNote" TEXT NOT NULL DEFAULT 'Come and walk through the building. See the classrooms with students in them, look at the library at 7 pm, ask the doubt counter a question. Fifteen minutes settles more than any brochure.';

-- CreateTable
CREATE TABLE "safety_points" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',
    "icon" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "safety_points_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "safety_points_order_idx" ON "safety_points"("order");
