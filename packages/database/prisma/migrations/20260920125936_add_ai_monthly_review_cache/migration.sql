-- CreateTable
CREATE TABLE "AiMonthlyReviewCache" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "highlights" JSONB NOT NULL,
    "areasToImprove" JSONB NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiMonthlyReviewCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AiMonthlyReviewCache_userId_month_year_key" ON "AiMonthlyReviewCache"("userId", "month", "year");

-- AddForeignKey
ALTER TABLE "AiMonthlyReviewCache" ADD CONSTRAINT "AiMonthlyReviewCache_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
