export enum BudgetCategory {
  Food = "Food & Dining",
  Shopping = "Shopping",
  Transport = "Transport",
  Bills = "Bills & Utilities",
  Entertainment = "Entertainment",
  Health = "Health & Wellness",
  Other = "Other"
}

export interface ReceiptEntry {
  id: string;
  date: string; // ISO string YYYY-MM-DD
  merchant: string;
  amount: number;
  category: BudgetCategory;
  currency: string;
  timestamp: number; // For sorting
}

export type TimeRange = 'Week' | 'Month' | 'Quarter' | 'Year' | 'All';

export const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD"];

export const CATEGORY_COLORS: Record<BudgetCategory, string> = {
  [BudgetCategory.Food]: "#ef4444", // Red-500
  [BudgetCategory.Shopping]: "#f97316", // Orange-500
  [BudgetCategory.Transport]: "#3b82f6", // Blue-500
  [BudgetCategory.Bills]: "#6366f1", // Indigo-500
  [BudgetCategory.Entertainment]: "#8b5cf6", // Violet-500
  [BudgetCategory.Health]: "#10b981", // Emerald-500
  [BudgetCategory.Other]: "#64748b", // Slate-500
};