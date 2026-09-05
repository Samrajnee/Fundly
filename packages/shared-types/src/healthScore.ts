export interface HealthScoreComponent {
  label: string;
  score: number;
  maxScore: number;
  message: string;
}

export interface FinancialHealthScoreDTO {
  totalScore: number;
  maxScore: number;
  components: HealthScoreComponent[];
}