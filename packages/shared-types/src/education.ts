export type EducationCategory = "BASICS" | "SAVINGS" | "INVESTING" | "INSURANCE" | "DEBT" | "TAX" | "RETIREMENT";

export interface EducationArticleSummaryDTO {
  slug: string;
  title: string;
  category: EducationCategory;
  summary: string;
  readMinutes: number;
}

export interface EducationArticleDTO extends EducationArticleSummaryDTO {
  content: string;
}