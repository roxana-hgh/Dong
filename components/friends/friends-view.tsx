// components/friends/friends-view.tsx
"use client";

import { useMemo, useState, useTransition } from "react";
import { Search, Users } from "lucide-react";
import { toast } from "sonner";
import { deleteFriendList } from "@/actions/friends";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AddFriendForm } from "./add-friend-form";
import { FilterChip } from "./filter-chip";
import { FriendRow } from "./friend-row";
import { NewListChip } from "./new-list-chip";
import type { FriendItem, FriendListItem } from "./types";

export function FriendsView({ friends, lists }: { friends: FriendItem[]; lists: FriendListItem[] }) {
  const [activeList, setActiveList] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();

  // If the active list was deleted, fall back to "all".
  const active = lists.some((l) => l.id === activeList) ? activeList : "all";
  const activeListItem = lists.find((l) => l.id === active);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return friends.filter(
      (f) => (active === "all" || f.listIds.includes(active)) && f.name.toLowerCase().includes(q),
    );
  }, [friends, active, query]);

  const removeList = () => {
    if (!activeListItem) return;
    startTransition(async () => {
      const res = await deleteFriendList({ listId: activeListItem.id });
      if (!res.ok) return void toast.error(res.error);
      setActiveList("all");
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Friends</h1>
        <p className="text-sm text-muted-foreground">
          Save the people you split with most, then add them to any group in one tap.
        </p>
      </header>

      <Card className="rounded-2xl">
        <CardContent className="space-y-4 pt-6">
          <AddFriendForm listIds={active === "all" ? [] : [active]} />

          <div role="group" aria-label="Filter by list" className="flex flex-wrap gap-2">
            <FilterChip active={active === "all"} count={friends.length} onClick={() => setActiveList("all")}>
              All
            </FilterChip>
            {lists.map((l) => (
              <FilterChip key={l.id} active={active === l.id} count={l.count} onClick={() => setActiveList(l.id)}>
                {l.name}
              </FilterChip>
            ))}
            <NewListChip />
          </div>

          {friends.length > 0 && (
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                aria-label="Search friends"
                placeholder="Search friends"
                className="pl-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          )}

          {friends.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
                <Users className="size-6" aria-hidden />
              </div>
              <p className="font-medium">No friends yet</p>
              <p className="max-w-xs text-sm text-muted-foreground">
                Add someone above, or save people from a group&apos;s Members page.
              </p>
            </div>
          ) : visible.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {active !== "all" && !query ? "No one in this list yet. Use the ⋯ menu on a friend to add them." : "No matches."}
            </p>
          ) : (
            <ul className="divide-y divide-border/60">
              {visible.map((f) => (
                <FriendRow key={f.id} friend={f} lists={lists} />
              ))}
            </ul>
          )}

          {activeListItem && (
            <div className="flex justify-end border-t pt-3">
              <Button variant="ghost" size="sm" disabled={pending} onClick={removeList} className="text-muted-foreground">
                Delete list “{activeListItem.name}”
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}