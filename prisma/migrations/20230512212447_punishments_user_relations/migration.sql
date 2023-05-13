/*
  Warnings:

  - Added the required column `userId` to the `punishments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "punishments" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "punishments" ADD CONSTRAINT "punishments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
