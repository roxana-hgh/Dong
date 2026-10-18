// components/friends/save-friend-button.tsx
"use client";

import { useTransition } from "react";
import { UserCheck, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { saveMembersAsFriends } from "@/actions/friends";
import { Button } from "@/components/ui/button";

export function SaveFriendButton({
  groupId,
  memberId,
  name,
  saved,
}: {
  groupId: string;
  memberId: string;
  name: string;
  saved: boolean;
}) {
  const [pending, startTransition] = useTransition();

  if (saved) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <UserCheck className="size-3.5" aria-hidden /> Friend
      </span>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={pending}
      aria-label={`Save ${name} to friends`}
      onClick={() =>
        startTransition(async () => {
          const res = await saveMembersAsFriends({ groupId, memberIds: [memberId] });
          if (!res.ok) return void toast.error(res.error);
          toast.success(`${name} saved to friends`);
        })
      }
    >
      <UserPlus className="size-4" aria-hidden /> Save
    </Button>
  );
}