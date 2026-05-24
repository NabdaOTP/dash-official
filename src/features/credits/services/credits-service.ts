import type { CreditBalance, CreditTransaction } from "../types";

export async function getCreditBalance(
  projectId: string
): Promise<CreditBalance> {
  throw new Error("Not implemented");
}

export async function purchaseCredits(
  projectId: string,
  amount: number
): Promise<CreditTransaction> {
  throw new Error("Not implemented");
}

export async function getCreditHistory(
  projectId: string
): Promise<CreditTransaction[]> {
  throw new Error("Not implemented");
}
