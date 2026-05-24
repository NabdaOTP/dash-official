export interface CreditBalance {
  projectId: string;
  balance: number;
}

export interface CreditTransaction {
  id: string;
  projectId: string;
  amount: number;
  createdAt: string;
  type: "purchase" | "usage";
}
