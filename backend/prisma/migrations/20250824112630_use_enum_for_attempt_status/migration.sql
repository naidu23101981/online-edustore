/*
  Warnings:

  - The `status` column on the `exam_attempts` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."AttemptStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'TIMED_OUT');

-- AlterTable
ALTER TABLE "public"."exam_attempts" DROP COLUMN "status",
ADD COLUMN     "status" "public"."AttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS';
