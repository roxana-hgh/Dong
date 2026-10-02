// import { describe, expect, it } from "vitest";
// import { computeBalances, type BalanceExpense } from "./balances";

// const members = ["roxana", "sara", "nima"];
// const dinner: BalanceExpense = {
//   paidById: "roxana",
//   amountMinor: 12000,
//   shares: [
//     { memberId: "roxana", shareMinor: 4000 },
//     { memberId: "sara", shareMinor: 4000 },
//     { memberId: "nima", shareMinor: 4000 },
//   ],
// };
// const byId = (rows: ReturnType<typeof computeBalances>) => new Map(rows.map((r) => [r.memberId, r]));

// describe("computeBalances", () => {
//   it("computes paid, share and balance per member", () => {
//     const b = byId(computeBalances(members, [dinner], []));
//     expect(b.get("roxana")).toMatchObject({ paidMinor: 12000, shareMinor: 4000, balanceMinor: 8000 });
//     expect(b.get("sara")?.balanceMinor).toBe(-4000);
//     expect(b.get("nima")?.balanceMinor).toBe(-4000);
//   });

//   it("applies recorded settlements", () => {
//     const b = byId(
//       computeBalances(members, [dinner], [{ fromMemberId: "sara", toMemberId: "roxana", amountMinor: 4000 }]),
//     );
//     expect(b.get("sara")?.balanceMinor).toBe(0);
//     expect(b.get("roxana")?.balanceMinor).toBe(4000);
//     expect(b.get("nima")?.balanceMinor).toBe(-4000);
//   });

//   it("returns zeros when there are no expenses", () => {
//     expect(computeBalances(members, [], []).every((r) => r.balanceMinor === 0)).toBe(true);
//   });

//   it("throws when shares do not add up to the amount", () => {
//     const broken = { ...dinner, shares: [{ memberId: "roxana", shareMinor: 4000 }] };
//     expect(() => computeBalances(members, [broken], [])).toThrow();
//   });

//   it("throws on unknown members", () => {
//     expect(() => computeBalances(["a"], [dinner], [])).toThrow(/Unknown member/);
//   });
// });