-- CreateEnum
CREATE TYPE "EducationCategory" AS ENUM ('BASICS', 'SAVINGS', 'INVESTING', 'INSURANCE', 'DEBT', 'TAX', 'RETIREMENT');

-- CreateTable
CREATE TABLE "EducationArticle" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "EducationCategory" NOT NULL,
    "summary" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "readMinutes" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EducationArticle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EducationArticle_slug_key" ON "EducationArticle"("slug");
