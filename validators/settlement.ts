import { z } from "zod";

export const markPaidSchema = z.object({
  groupId: z.string().min(1),
  fromMemberId: z.string().min(1),
  toMemberId: z.string().min(1),
  amountMinor: z.number().int().positive().max(2_000_000_000),
});

export const undoSettlementSchema = z.object({
  groupId: z.string().min(1),
  settlementId: z.string().min(1),
});