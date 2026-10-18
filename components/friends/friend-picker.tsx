// components/friends/friend-picker.tsx
"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Check, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/shared/user-avatar";
import { cn } from "@/lib/utils";
import { FilterChip } from "./filter-chip";
import type { FriendItem, FriendListItem } from "./types";

const keyOf = (name: string) => name.trim().toLowerCase();

export function FriendPicker({
  friends,
  lists,
  takenNames,
  onConfirm,
  trigger,
  confirmLabel = "Add",
}: {
  friends: FriendItem[];
  lists: FriendListItem[];
  /** Names already in the form/group: shown as "Already added" and not selectable. */
  takenNames: string[];
  onConfirm: (picked: FriendItem[]) => void | Promise<void>;
  trigger: React.ReactNode;
  confirmLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeList, setActiveList] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  const taken = useMemo(() => new Set(takenNames.map(keyOf)), [takenNames]);
  const isTaken = (f: FriendItem) => taken.has(keyOf(f.name));

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return friends.filter(
      (f) => (activeList === "all" || f.listIds.includes(activeList)) && f.name.toLowerCase().includes(q),
    );
  }, [friends, activeList, query]);

  const selectable = visible.filter((f) => !isTaken(f));
  const allSelected = selectable.length > 0 && selectable.every((f) => selected.has(f.id));

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      for (const f of selectable) {
        if (allSelected) next.delete(f.id);
        else next.add(f.id);
      }
      return next;
    });

  const confirm = () =>
    startTransition(async () => {
      await onConfirm(friends.filter((f) => selected.has(f.id) && !isTaken(f)));
      setSelected(new Set());
      setOpen(false);
    });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="gap-4 rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add from friends</DialogTitle>
          <DialogDescription>Pick the people to add. Tap a list to narrow it down.</DialogDescription>
        </DialogHeader>

        {friends.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            You haven&apos;t saved any friends yet.{" "}
            <Link href="/friends" className="font-medium text-primary underline-offset-4 hover:underline">
              Go to Friends
            </Link>
          </p>
        ) : (
          <>
            {lists.length > 0 && (
              <div role="group" aria-label="Filter by list" className="flex flex-wrap gap-2">
                <FilterChip active={activeList === "all"} onClick={() => setActiveList("all")}>All</FilterChip>
                {lists.map((l) => (
                  <FilterChip key={l.id} active={activeList === l.id} count={l.count} onClick={() => setActiveList(l.id)}>
                    {l.name}
                  </FilterChip>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input
                  aria-label="Search friends"
                  placeholder="Search"
                  className="pl-9"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <Button type="button" variant="outline" size="sm" onClick={toggleAll} disabled={selectable.length === 0}>
                {allSelected ? "Clear" : "Select all"}
              </Button>
            </div>

            <ul className="-mx-1 max-h-72 space-y-0.5 overflow-y-auto px-1" role="group" aria-label="Friends">
              {visible.length === 0 && (
                <li className="py-6 text-center text-sm text-muted-foreground">No matches.</li>
              )}
              {visible.map((f) => {
                const on = selected.has(f.id);
                const disabled = isTaken(f);
                return (
                  <li key={f.id}>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={on}
                      disabled={disabled}
                      onClick={() => toggle(f.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50",
                        on && "bg-primary/5",
                      )}
                    >
                      <UserAvatar name={f.name} />
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">{f.name}</span>
                      {disabled ? (
                        <span className="text-xs text-muted-foreground">Already added</span>
                      ) : (
                        <span
                          className={cn(
                            "grid size-5 place-items-center rounded-full border",
                            on ? "border-primary bg-primary text-primary-foreground" : "border-border",
                          )}
                        >
                          {on && <Check className="size-3.5" aria-hidden />}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        <DialogFooter>
          <Button type="button" className="w-full sm:w-auto" disabled={selected.size === 0 || pending} onClick={confirm}>
            {pending ? "Adding…" : `${confirmLabel}${selected.size > 0 ? ` (${selected.size})` : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}