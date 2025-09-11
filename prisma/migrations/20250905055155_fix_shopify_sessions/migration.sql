/*
  Warnings:

  - You are about to drop the column `accountOwner` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `collaborator` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `locale` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `sessions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `sessions` DROP COLUMN `accountOwner`,
    DROP COLUMN `collaborator`,
    DROP COLUMN `email`,
    DROP COLUMN `emailVerified`,
    DROP COLUMN `firstName`,
    DROP COLUMN `lastName`,
    DROP COLUMN `locale`,
    DROP COLUMN `userId`,
    MODIFY `expires` BIGINT NULL,
    MODIFY `accessToken` VARCHAR(191) NULL;
