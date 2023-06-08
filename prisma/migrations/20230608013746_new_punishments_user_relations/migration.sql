/*
  Warnings:

  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "punishments" DROP CONSTRAINT "punishments_userId_fkey";

-- AlterTable
ALTER TABLE "punishments" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "users";
