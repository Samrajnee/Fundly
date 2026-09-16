-- CreateEnum
CREATE TYPE "AiFeature" AS ENUM ('SALARY_ALLOCATION', 'EXPENSE_PARSE', 'ASSISTANT', 'MONTHLY_REVIEW', 'GOAL_PLANNER', 'WHAT_IF');

-- CreateTable
CREATE TABLE "AiUsageLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "feature" "AiFeature" NOT NULL,
    "succeeded" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiUsageLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiUsageLog_userId_createdAt_idx" ON "AiUsageLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AiUsageLog_createdAt_idx" ON "AiUsageLog"("createdAt");

-- AddForeignKey
ALTER TABLE "AiUsageLog" ADD CONSTRAINT "AiUsageLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
