// components/friends/new-list-chip.tsx
"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createFriendList } from "@/actions/friends";
import { Input } from "@/components/ui/input";

export function NewListChip() {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();

  const submit = () => {
    const value = name.trim();
    if (!value) return setEditing(false);
    startTransition(async () => {
      const res = await createFriendList({ name: value });
      if (!res.ok) return void toast.error(res.error);
      setName("");
      setEditing(false);
    });
  };

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="inline-flex h-8 items-center gap-1 rounded-full border border-dashed px-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <Plus className="size-3.5" aria-hidden /> New list
      </button>
    );
  }

  return (
    <Input
      autoFocus
      aria-label="New list name"
      placeholder="e.g. Coworkers"
      maxLength={30}
      value={name}
      disabled={pending}
      onChange={(e) => setName(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") { e.preventDefault(); submit(); }
        if (e.key === "Escape") { setName(""); setEditing(false); }
      }}
      onBlur={() => { if (!name.trim() && !pending) setEditing(false); }}
      className="h-8 w-40 rounded-full"
    />
  );
}