-- CreateTable
CREATE TABLE "SpendingSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "totalSpend" DECIMAL(12,2) NOT NULL,
    "savingsRate" DECIMAL(5,2) NOT NULL,
    "categoryBreakdown" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpendingSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SpendingSnapshot_userId_month_year_key" ON "SpendingSnapshot"("userId", "month", "year");

-- AddForeignKey
ALTER TABLE "SpendingSnapshot" ADD CONSTRAINT "SpendingSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
