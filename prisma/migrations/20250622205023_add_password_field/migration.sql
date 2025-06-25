/*
  Warnings:

  - You are about to drop the column `created_at` on the `rooms` table. All the data in the column will be lost.
  - You are about to drop the column `creator_id` on the `rooms` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `rooms` table. All the data in the column will be lost.
  - You are about to drop the column `options` on the `rooms` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `rooms` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `votes` table. All the data in the column will be lost.
  - You are about to drop the column `room_id` on the `votes` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `votes` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,roomId]` on the table `votes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `creatorId` to the `rooms` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `rooms` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `users` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `roomId` to the `votes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `votes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "rooms" DROP CONSTRAINT "rooms_creator_id_fkey";

-- DropForeignKey
ALTER TABLE "votes" DROP CONSTRAINT "votes_room_id_fkey";

-- DropForeignKey
ALTER TABLE "votes" DROP CONSTRAINT "votes_user_id_fkey";

-- DropIndex
DROP INDEX "votes_user_id_room_id_key";

-- AlterTable
ALTER TABLE "rooms" DROP COLUMN "created_at",
DROP COLUMN "creator_id",
DROP COLUMN "is_active",
DROP COLUMN "options",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "creatorId" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "name" SET NOT NULL;

-- AlterTable
ALTER TABLE "votes" DROP COLUMN "created_at",
DROP COLUMN "room_id",
DROP COLUMN "user_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "roomId" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "votes_userId_roomId_key" ON "votes"("userId", "roomId");

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
