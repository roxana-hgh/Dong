// lib/data/friends.ts
import { FriendItem, FriendListItem } from "@/components/friends/types";
import { db } from "@/lib/db";


export async function getFriendsData(ownerId: string): Promise<{ friends: FriendItem[]; lists: FriendListItem[] }> {
  const [friends, lists] = await Promise.all([
    db.friend.findMany({
      where: { ownerId },
      orderBy: { name: "asc" },
      select: { id: true, name: true, lists: { select: { id: true } } },
    }),
    db.friendList.findMany({
      where: { ownerId },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, _count: { select: { friends: true } } },
    }),
  ]);

  return {
    friends: friends.map((f) => ({ id: f.id, name: f.name, listIds: f.lists.map((l) => l.id) })),
    lists: lists.map((l) => ({ id: l.id, name: l.name, count: l._count.friends })),
  };
}