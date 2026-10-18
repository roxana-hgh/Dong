// validators/friend.ts
import { z } from "zod";

const personName = z.string().trim().min(1, "Name is required").max(40, "Max 40 characters");
const id = z.string().min(1);

export const friendNameSchema = z.object({ name: personName });
export type FriendNameInput = z.infer<typeof friendNameSchema>;

export const addFriendSchema = friendNameSchema.extend({
  listIds: z.array(id).max(20).default([]),
});
export const removeFriendSchema = z.object({ friendId: id });
export const friendListSchema = z.object({
  name: z.string().trim().min(1, "List name is required").max(30, "Max 30 characters"),
});
export const deleteFriendListSchema = z.object({ listId: id });
export const setFriendListsSchema = z.object({ friendId: id, listIds: z.array(id).max(20) });
export const saveMembersAsFriendsSchema = z.object({
  groupId: id,
  memberIds: z.array(id).min(1).max(50),
});
export const addFriendsToGroupSchema = z.object({
  groupId: id,
  friendIds: z.array(id).min(1).max(30),
});