/*
  Warnings:

  - You are about to drop the column `url` on the `File` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "File" DROP COLUMN "url",
ADD COLUMN     "name" TEXT NOT NULL DEFAULT 'Untitled',
ADD COLUMN     "processedFileId" TEXT,
ADD COLUMN     "state" TEXT NOT NULL DEFAULT 'uploading';
