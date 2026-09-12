-- Per-user Counselling toggle, independent of role
ALTER TABLE "admin_users" ADD COLUMN "counsellingAccess" BOOLEAN NOT NULL DEFAULT false;

-- Remove the unused MENTORA_COUNSELLING role (replaced by the toggle above —
-- verified zero rows in admin_users/staff_roles use it before this migration)
CREATE TYPE "StaffRoleName_new" AS ENUM ('SUPER_ADMIN', 'COUNSELLOR', 'EDITOR');

ALTER TABLE "admin_users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "admin_users" ALTER COLUMN "role" TYPE "StaffRoleName_new" USING ("role"::text::"StaffRoleName_new");
ALTER TABLE "staff_roles" ALTER COLUMN "role" TYPE "StaffRoleName_new" USING ("role"::text::"StaffRoleName_new");

ALTER TYPE "StaffRoleName" RENAME TO "StaffRoleName_old";
ALTER TYPE "StaffRoleName_new" RENAME TO "StaffRoleName";
DROP TYPE "StaffRoleName_old";

ALTER TABLE "admin_users" ALTER COLUMN "role" SET DEFAULT 'SUPER_ADMIN';
