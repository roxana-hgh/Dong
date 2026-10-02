"use client";

import { useTransition } from "react";
import { Undo2 } from "lucide-react";
import { toast } from "sonner";
import { undoSettlement } from "@/actions/settlements";
import { Button } from "@/components/ui/button";

export function UndoSettlementButton({ groupId, settlementId }: { groupId: string; settlementId: string }) {
  const [pending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      const res = await undoSettlement({ groupId, settlementId });
      if (!res.ok) toast.error(res.error);
      else toast.success("Payment undone");
    });
  }

  return (
    <Button variant="ghost" size="sm" onClick={onClick} disabled={pending}>
      <Undo2 className="size-4" aria-hidden /> Undo
    </Button>
  );
}