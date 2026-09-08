-- CreateTable
CREATE TABLE "MonthlyPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "necessitiesTarget" DECIMAL(12,2) NOT NULL,
    "lifestyleTarget" DECIMAL(12,2) NOT NULL,
    "savingsTarget" DECIMAL(12,2) NOT NULL,
    "investmentsTarget" DECIMAL(12,2) NOT NULL,
    "goalsTarget" DECIMAL(12,2) NOT NULL,
    "bufferTarget" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyPlan_userId_month_year_key" ON "MonthlyPlan"("userId", "month", "year");

-- AddForeignKey
ALTER TABLE "MonthlyPlan" ADD CONSTRAINT "MonthlyPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
