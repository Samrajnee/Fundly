export interface AIMonthlyReviewDTO {
  summary: string;
  highlights: string[];
  areasToImprove: string[];
  source: "AI" | "UNAVAILABLE";
}