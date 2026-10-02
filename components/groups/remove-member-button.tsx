"use client";

import { useTransition } from "react";
import { UserMinus } from "lucide-react";
import { toast } from "sonner";
import { removeMember } from "@/actions/groups";
import { Button } from "@/components/ui/button";

export function RemoveMemberButton({ groupId, memberId, name }: { groupId: string; memberId: string; name: string }) {
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (!window.confirm(`Remove ${name} from the group?`)) return;
    startTransition(async () => {
      const res = await removeMember({ groupId, memberId });
      if (!res.ok) toast.error(res.error);
    });
  }

  return (
    <Button variant="ghost" size="icon" aria-label={`Remove ${name}`} disabled={pending} onClick={onClick}>
      <UserMinus className="size-4" />
    </Button>
  );
}