// components/friends/add-from-friends-button.tsx
"use client";

import { Users } from "lucide-react";
import { toast } from "sonner";
import { addFriendsToGroup } from "@/actions/friends";
import { Button } from "@/components/ui/button";
import { FriendPicker } from "./friend-picker";
import type { FriendItem, FriendListItem } from "./types";

export function AddFromFriendsButton({
  groupId,
  friends,
  lists,
  takenNames,
}: {
  groupId: string;
  friends: FriendItem[];
  lists: FriendListItem[];
  takenNames: string[];
}) {
  return (
    <FriendPicker
      friends={friends}
      lists={lists}
      takenNames={takenNames}
      confirmLabel="Add to group"
      trigger={
        <Button type="button" variant="outline">
          <Users className="size-4" aria-hidden /> From friends
        </Button>
      }
      onConfirm={async (picked) => {
        const res = await addFriendsToGroup({ groupId, friendIds: picked.map((f) => f.id) });
        if (!res.ok) return void toast.error(res.error);
        toast.success(res.data.added === 1 ? "1 person added" : `${res.data.added} people added`);
      }}
    />
  );
}