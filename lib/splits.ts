import { parseMoneyToMinor } from "./money";

export type SplitType = "EQUAL" | "PERCENTAGE" | "EXACT";
export type ShareItem = { memberId: string; shareMinor: number };
export type SplitResult = { ok: true; shares: ShareItem[] } | { ok: false; error: string };

export type SplitInput =
  | { type: "EQUAL"; totalMinor: number; participants: { memberId: string }[] }
  | { type: "PERCENTAGE"; totalMinor: number; participants: { memberId: string; basisPoints: number }[] }
  | { type: "EXACT"; totalMinor: number; participants: { memberId: string; amountMinor: number }[] };

const BP_TOTAL = 10_000; // 100.00%
const fail = (error: string): SplitResult => ({ ok: false, error });
const byId = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

/** Remainder cents go to the first N members in stable (id) order. */
export function splitEqual(totalMinor: number, memberIds: string[]): ShareItem[] {
  const ids = [...memberIds].sort(byId);
  const base = Math.floor(totalMinor / ids.length);
  const remainder = totalMinor - base * ids.length;
  return ids.map((memberId, i) => ({ memberId, shareMinor: base + (i < remainder ? 1 : 0) }));
}

/** Largest-remainder method: the sum always equals totalMinor. */
export function splitByPercentage(
  totalMinor: number,
  parts: { memberId: string; basisPoints: number }[],
): ShareItem[] {
  const rows = parts.map((p) => {
    const numerator = totalMinor * p.basisPoints; // exact integer (< 2^53)
    const remainder = numerator % BP_TOTAL;
    return { memberId: p.memberId, floor: (numerator - remainder) / BP_TOTAL, remainder };
  });
  const leftover = totalMinor - rows.reduce((sum, r) => sum + r.floor, 0);
  const winners = new Set(
    [...rows]
      .sort((a, b) => b.remainder - a.remainder || byId(a.memberId, b.memberId))
      .slice(0, leftover)
      .map((r) => r.memberId),
  );
  return rows
    .map((r) => ({ memberId: r.memberId, shareMinor: r.floor + (winners.has(r.memberId) ? 1 : 0) }))
    .sort((a, b) => byId(a.memberId, b.memberId));
}

function hasDuplicates(items: ReadonlyArray<{ memberId: string }>): boolean {
  return new Set(items.map((i) => i.memberId)).size !== items.length;
}

export function resolveSplit(input: SplitInput): SplitResult {
  const { totalMinor } = input;
  if (!Number.isInteger(totalMinor) || totalMinor <= 0) return fail("Amount must be greater than 0");
  if (input.participants.length === 0) return fail("Select at least one person");
  if (hasDuplicates(input.participants)) return fail("Duplicate participants");

  switch (input.type) {
    case "EQUAL":
      return { ok: true, shares: splitEqual(totalMinor, input.participants.map((p) => p.memberId)) };

    case "PERCENTAGE": {
      const parts = input.participants;
      if (parts.some((p) => !Number.isInteger(p.basisPoints) || p.basisPoints <= 0)) {
        return fail("Every percentage must be greater than 0");
      }
      if (parts.reduce((s, p) => s + p.basisPoints, 0) !== BP_TOTAL) {
        return fail("Percentages must add up to 100%");
      }
      return { ok: true, shares: splitByPercentage(totalMinor, parts) };
    }

    case "EXACT": {
      const parts = input.participants;
      if (parts.some((p) => !Number.isInteger(p.amountMinor) || p.amountMinor <= 0)) {
        return fail("Every amount must be greater than 0");
      }
      if (parts.reduce((s, p) => s + p.amountMinor, 0) !== totalMinor) {
        return fail("Amounts must add up to the total");
      }
      return {
        ok: true,
        shares: parts
          .map((p) => ({ memberId: p.memberId, shareMinor: p.amountMinor }))
          .sort((a, b) => byId(a.memberId, b.memberId)),
      };
    }
  }
}

export type FormParticipant = { memberId: string; included: boolean; value: string };

/** Adapter for form data (string inputs). Used by BOTH the client preview and the server action. */
export function resolveSplitFromForm(
  totalMinor: number,
  type: SplitType,
  participants: FormParticipant[],
): SplitResult {
  const included = participants.filter((p) => p.included);

  if (type === "EQUAL") {
    return resolveSplit({ type, totalMinor, participants: included.map((p) => ({ memberId: p.memberId })) });
  }

  const rows: { memberId: string; hundredths: number }[] = [];
  for (const p of included) {
    const h = parseMoneyToMinor(p.value);
    if (h === null) {
      return fail(type === "PERCENTAGE" ? "Enter a valid percentage for everyone selected" : "Enter a valid amount for everyone selected");
    }
    rows.push({ memberId: p.memberId, hundredths: h });
  }

  return type === "PERCENTAGE"
    ? resolveSplit({ type, totalMinor, participants: rows.map((r) => ({ memberId: r.memberId, basisPoints: r.hundredths })) })
    : resolveSplit({ type, totalMinor, participants: rows.map((r) => ({ memberId: r.memberId, amountMinor: r.hundredths })) });
}