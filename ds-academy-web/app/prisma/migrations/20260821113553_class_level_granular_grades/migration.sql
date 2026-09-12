-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ClassLevel" ADD VALUE 'ELEMENTARY';
ALTER TYPE "ClassLevel" ADD VALUE 'CLASS_6';
ALTER TYPE "ClassLevel" ADD VALUE 'CLASS_7';
ALTER TYPE "ClassLevel" ADD VALUE 'CLASS_8';
ALTER TYPE "ClassLevel" ADD VALUE 'CLASS_9';
ALTER TYPE "ClassLevel" ADD VALUE 'CLASS_10';
