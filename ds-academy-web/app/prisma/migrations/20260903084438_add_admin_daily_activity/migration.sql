-- AlterTable
ALTER TABLE "admin_users" ADD COLUMN     "lastActiveAt" TIMESTAMP(3),
ADD COLUMN     "previousActiveAt" TIMESTAMP(3);
