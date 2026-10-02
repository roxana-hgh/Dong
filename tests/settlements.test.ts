// import { describe, expect, it } from "vitest";
// import { simplifyDebts, type Transfer } from "./settlements";

// const apply = (balances: { memberId: string; balanceMinor: number }[], transfers: Transfer[]) => {
//   const map = new Map(balances.map((b) => [b.memberId, b.balanceMinor]));
//   for (const t of transfers) {
//     map.set(t.fromMemberId, (map.get(t.fromMemberId) ?? 0) + t.amountMinor);
//     map.set(t.toMemberId, (map.get(t.toMemberId) ?? 0) - t.amountMinor);
//   }
//   return [...map.values()];
// };

// describe("simplifyDebts", () => {
//   it("returns nothing when everyone is settled", () => {
//     expect(simplifyDebts([{ memberId: "a", balanceMinor: 0 }, { memberId: "b", balanceMinor: 0 }])).toEqual([]);
//     expect(simplifyDebts([])).toEqual([]);
//   });

//   it("handles a single creditor", () => {
//     const t = simplifyDebts([
//       { memberId: "a", balanceMinor: 9000 },
//       { memberId: "b", balanceMinor: -3000 },
//       { memberId: "c", balanceMinor: -6000 },
//     ]);
//     expect(t).toEqual([
//       { fromMemberId: "c", toMemberId: "a", amountMinor: 6000 },
//       { fromMemberId: "b", toMemberId: "a", amountMinor: 3000 },
//     ]);
//   });

//   it("is deterministic with ties, regardless of input order", () => {
//     const input = [
//       { memberId: "roxana", balanceMinor: 8000 },
//       { memberId: "sara", balanceMinor: -4000 },
//       { memberId: "nima", balanceMinor: -4000 },
//     ];
//     const expected = [
//       { fromMemberId: "nima", toMemberId: "roxana", amountMinor: 4000 },
//       { fromMemberId: "sara", toMemberId: "roxana", amountMinor: 4000 },
//     ];
//     expect(simplifyDebts(input)).toEqual(expected);
//     expect(simplifyDebts([...input].reverse())).toEqual(expected);
//   });

//   it("settles everyone with at most n-1 transfers (random zero-sum inputs)", () => {
//     let seed = 42;
//     const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;

//     for (let round = 0; round < 200; round++) {
//       const n = 2 + Math.floor(rnd() * 8);
//       const values = Array.from({ length: n - 1 }, () => Math.floor(rnd() * 10001) - 5000);
//       values.push(-values.reduce((s, v) => s + v, 0));
//       const balances = values.map((balanceMinor, i) => ({ memberId: `m${i}`, balanceMinor }));

//       const transfers = simplifyDebts(balances);
//       expect(transfers.length).toBeLessThanOrEqual(n - 1);
//       expect(transfers.every((t) => t.amountMinor > 0)).toBe(true);
//       expect(apply(balances, transfers).every((v) => v === 0)).toBe(true);
//     }
//   });

//   it("throws if balances do not sum to zero", () => {
//     expect(() => simplifyDebts([{ memberId: "a", balanceMinor: 100 }])).toThrow();
//   });
// });