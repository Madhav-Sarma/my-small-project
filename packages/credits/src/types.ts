export type CreditTransactionType =
  | "purchase"
  | "usage"
  | "refund"
  | "subscription_credit"
  | "bonus";

export interface DeductCreditsOptions {
  organizationId: string;
  userId?: string;
  amount: number;
  description?: string;
  /** e.g. "tool_execution" | "agent_run" | "workflow_run" */
  referenceType?: string;
  referenceId?: string;
  metadata?: Record<string, unknown>;
}

export interface AddCreditsOptions {
  organizationId: string;
  userId?: string;
  amount: number;
  type?: CreditTransactionType;
  description?: string;
  referenceType?: string;
  referenceId?: string;
  metadata?: Record<string, unknown>;
}

export interface WalletOperationResult {
  newBalance: number;
  transactionId: string;
}

export interface WalletBalance {
  organizationId: string;
  balance: number;
}
