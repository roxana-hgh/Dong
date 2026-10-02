import { z } from "zod";

const personName = (label: string) =>
  z.string().trim().min(1, `${label} is required`).max(40, "Max 40 characters");

const uniqueNames = (names: string[]) => {
  const lower = names.map((n) => n.trim().toLowerCase());
  return new Set(lower).size === lower.length;
};

export const createGroupSchema = z
  .object({
    name: z.string().trim().min(1, "Group name is required").max(60, "Max 60 characters"),
    yourName: personName("Your name"),
    members: z.array(z.object({ name: personName("Name") })).max(30),
  })
  .refine((v) => uniqueNames([v.yourName, ...v.members.map((m) => m.name)]), {
    message: "Names must be unique",
    path: ["members"],
  });
export type CreateGroupInput = z.infer<typeof createGroupSchema>;

export const addMemberSchema = z.object({
  groupId: z.string().min(1),
  name: personName("Name"),
});
export type AddMemberInput = z.infer<typeof addMemberSchema>;

export const removeMemberSchema = z.object({
  groupId: z.string().min(1),
  memberId: z.string().min(1),
});

export const joinGroupSchema = z
  .object({
    token: z.string().min(1),
    displayName: z.string().trim().max(40).optional(),
    claimMemberId: z.string().min(1).optional(),
  })
  .refine((v) => Boolean(v.claimMemberId) || Boolean(v.displayName), {
    message: "Enter your name or pick who you are",
    path: ["displayName"],
  });