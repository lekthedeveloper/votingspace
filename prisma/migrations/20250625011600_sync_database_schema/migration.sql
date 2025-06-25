/*
  Warnings:

  - A unique constraint covering the columns `[joinCode]` on the table `rooms` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[guestId,roomId]` on the table `votes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `joinCode` to the `rooms` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `votes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "rooms" DROP CONSTRAINT "rooms_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "votes" DROP CONSTRAINT "votes_roomId_fkey";

-- DropForeignKey
ALTER TABLE "votes" DROP CONSTRAINT "votes_userId_fkey";

-- AlterTable
ALTER TABLE "rooms" ADD COLUMN     "allowMultipleVotes" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deadline" TIMESTAMP(3),
ADD COLUMN     "isAnonymous" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isClosed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "joinCode" TEXT NOT NULL,
ADD COLUMN     "options" TEXT[];

-- AlterTable
ALTER TABLE "votes" ADD COLUMN     "guestId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "rooms_joinCode_key" ON "rooms"("joinCode");

-- CreateIndex
CREATE UNIQUE INDEX "votes_guestId_roomId_key" ON "votes"("guestId", "roomId");

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
