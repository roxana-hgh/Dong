import { z } from "zod";
import { parseMoneyToMinor } from "@/lib/money";

export const SPLIT_TYPES = ["EQUAL", "PERCENTAGE", "EXACT"] as const;
export const CATEGORIES = ["FOOD", "TRANSPORT", "ACCOMMODATION", "ENTERTAINMENT", "OTHER"] as const;

// One flat shape on purpose: it works well with react-hook-form (no discriminated unions in forms).
// `value` means "percent" or "amount" depending on splitType; resolveSplitFromForm interprets it.
export const expenseSchema = z
  .object({
    groupId: z.string().min(1),
    title: z.string().trim().min(1, "Title is required").max(80, "Max 80 characters"),
    amount: z.string().trim().refine((v) => {
      const minor = parseMoneyToMinor(v);
      return minor !== null && minor > 0;
    }, "Enter a valid amount, e.g. 12.50"),
    paidById: z.string().min(1, "Select who paid"),
    category: z.enum(CATEGORIES),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
    note: z.string().trim().max(300).optional(),
    splitType: z.enum(SPLIT_TYPES),
    participants: z.array(
      z.object({ memberId: z.string().min(1), included: z.boolean(), value: z.string() }),
    ),
  })
  .refine((v) => v.participants.some((p) => p.included), {
    message: "Select at least one person",
    path: ["participants"],
  });
export type ExpenseInput = z.infer<typeof expenseSchema>;

export const deleteExpenseSchema = z.object({
  groupId: z.string().min(1),
  expenseId: z.string().min(1),
});