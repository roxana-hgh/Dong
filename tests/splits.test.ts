// import { resolveSplit, resolveSplitFromForm, splitByPercentage, splitEqual } from "@/lib/splits";
// import { describe, expect, it } from "vitest";


// const sum = (shares: { shareMinor: number }[]) => shares.reduce((s, x) => s + x.shareMinor, 0);

// describe("splitEqual", () => {
//   it("distributes the remainder to the first members", () => {
//     const shares = splitEqual(100, ["c", "a", "b"]);
//     expect(shares.map((s) => s.shareMinor)).toEqual([34, 33, 33]);
//     expect(sum(shares)).toBe(100);
//   });

//   it("is deterministic regardless of input order", () => {
//     expect(splitEqual(101, ["b", "a", "c"])).toEqual(splitEqual(101, ["c", "b", "a"]));
//   });

//   it("always sums to the total", () => {
//     for (let total = 1; total <= 500; total++) {
//       for (let n = 1; n <= 7; n++) {
//         const ids = Array.from({ length: n }, (_, i) => `m${i}`);
//         expect(sum(splitEqual(total, ids))).toBe(total);
//       }
//     }
//   });
// });

// describe("splitByPercentage", () => {
//   it("uses largest remainder so the sum matches", () => {
//     const shares = splitByPercentage(1000, [
//       { memberId: "a", basisPoints: 3333 },
//       { memberId: "b", basisPoints: 3333 },
//       { memberId: "c", basisPoints: 3334 },
//     ]);
//     expect(sum(shares)).toBe(1000);
//   });

//   it("sums exactly for awkward totals", () => {
//     const shares = splitByPercentage(1, [
//       { memberId: "a", basisPoints: 5000 },
//       { memberId: "b", basisPoints: 5000 },
//     ]);
//     expect(sum(shares)).toBe(1);
//   });
// });

// describe("resolveSplit validation", () => {
//   it("rejects percentages that do not sum to 100", () => {
//     const r = resolveSplit({
//       type: "PERCENTAGE",
//       totalMinor: 1000,
//       participants: [{ memberId: "a", basisPoints: 5000 }, { memberId: "b", basisPoints: 4000 }],
//     });
//     expect(r.ok).toBe(false);
//   });

//   it("rejects exact amounts that do not match the total", () => {
//     const r = resolveSplit({
//       type: "EXACT",
//       totalMinor: 1000,
//       participants: [{ memberId: "a", amountMinor: 600 }, { memberId: "b", amountMinor: 300 }],
//     });
//     expect(r.ok).toBe(false);
//   });

//   it("rejects empty and duplicate participants", () => {
//     expect(resolveSplit({ type: "EQUAL", totalMinor: 100, participants: [] }).ok).toBe(false);
//     expect(
//       resolveSplit({ type: "EQUAL", totalMinor: 100, participants: [{ memberId: "a" }, { memberId: "a" }] }).ok,
//     ).toBe(false);
//   });
// });

// describe("resolveSplitFromForm", () => {
//   it("parses percent strings into basis points", () => {
//     const r = resolveSplitFromForm(1000, "PERCENTAGE", [
//       { memberId: "a", included: true, value: "33.33" },
//       { memberId: "b", included: true, value: "33.33" },
//       { memberId: "c", included: true, value: "33.34" },
//       { memberId: "d", included: false, value: "" },
//     ]);
//     expect(r.ok && sum(r.shares)).toBe(1000);
//   });

//   it("ignores unchecked members for EQUAL", () => {
//     const r = resolveSplitFromForm(1000, "EQUAL", [
//       { memberId: "a", included: true, value: "" },
//       { memberId: "b", included: false, value: "" },
//     ]);
//     expect(r.ok && r.shares).toEqual([{ memberId: "a", shareMinor: 1000 }]);
//   });
// });