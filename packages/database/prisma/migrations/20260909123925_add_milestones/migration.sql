-- CreateEnum
CREATE TYPE "MilestoneKey" AS ENUM ('SAVED_50K', 'SAVED_1L', 'INVESTED_1L', 'EMERGENCY_FUND_3_MONTHS', 'EMERGENCY_FUND_6_MONTHS', 'DEBT_FREE', 'FIRST_GOAL_COMPLETED', 'NET_WORTH_POSITIVE');

-- CreateTable
CREATE TABLE "MilestoneAchievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" "MilestoneKey" NOT NULL,
    "achievedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MilestoneAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MilestoneAchievement_userId_key_key" ON "MilestoneAchievement"("userId", "key");

-- AddForeignKey
ALTER TABLE "MilestoneAchievement" ADD CONSTRAINT "MilestoneAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
