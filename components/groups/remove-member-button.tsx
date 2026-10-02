"use client";

import { useState, useTransition } from "react";
import { UserMinus } from "lucide-react";
import { toast } from "sonner";
import { removeMember } from "@/actions/groups";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

export function RemoveMemberButton({ groupId, memberId, name }: { groupId: string; memberId: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function onConfirm() {
    startTransition(async () => {
      const res = await removeMember({ groupId, memberId });
      if (!res.ok) toast.error(res.error);
      setOpen(false);
    });
  }

  return (
    <>
      <Button variant="ghost" size="icon" aria-label={`Remove ${name}`} onClick={() => setOpen(true)}>
        <UserMinus className="size-4" />
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={`Remove ${name}?`}
        description={`${name} will be removed from the group.`}
        confirmLabel="Remove"
        destructive
        pending={pending}
        onConfirm={onConfirm}
      />
    </>
  );
}