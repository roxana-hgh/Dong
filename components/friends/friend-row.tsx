// components/friends/friend-row.tsx
"use client";

import { useTransition } from "react";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { removeFriend, setFriendLists } from "@/actions/friends";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/shared/user-avatar";
import type { FriendItem, FriendListItem } from "./types";

export function FriendRow({ friend, lists }: { friend: FriendItem; lists: FriendListItem[] }) {
  const [pending, startTransition] = useTransition();
  const memberOf = lists.filter((l) => friend.listIds.includes(l.id));

  const toggleList = (listId: string, checked: boolean) => {
    const next = checked ? [...friend.listIds, listId] : friend.listIds.filter((id) => id !== listId);
    startTransition(async () => {
      const res = await setFriendLists({ friendId: friend.id, listIds: next });
      if (!res.ok) toast.error(res.error);
    });
  };

  const remove = () =>
    startTransition(async () => {
      const res = await removeFriend({ friendId: friend.id });
      if (!res.ok) toast.error(res.error);
    });

  return (
    <li className="flex items-center gap-3 py-2.5" aria-busy={pending}>
      <UserAvatar name={friend.name} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{friend.name}</p>
        {memberOf.length > 0 && (
          <div className="mt-1! py-1 flex flex-wrap gap-1">
            {memberOf.map((l) => (
              <span key={l.id} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {l.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Options for ${friend.name}`} disabled={pending}>
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel>Lists</DropdownMenuLabel>
          {lists.length === 0 && (
            <p className="px-2 py-1.5 text-xs text-muted-foreground">Create a list first</p>
          )}
          {lists.map((l) => (
            <DropdownMenuCheckboxItem
              key={l.id}
              checked={friend.listIds.includes(l.id)}
              onCheckedChange={(c) => toggleList(l.id, c === true)}
              onSelect={(e) => e.preventDefault()} // keep the menu open while toggling several lists
            >
              {l.name}
            </DropdownMenuCheckboxItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={remove} className="text-destructive focus:text-destructive">
            <Trash2 className="size-4" aria-hidden /> Remove friend
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}