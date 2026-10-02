"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { markSettlementPaid } from "@/actions/settlements";
import { Button } from "@/components/ui/button";

type Props = { groupId: string; fromMemberId: string; toMemberId: string; amountMinor: number };

export function MarkPaidButton(props: Props) {
  const [pending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      const res = await markSettlementPaid(props);
      if (!res.ok) toast.error(res.error);
      else toast.success("Marked as paid");
    });
  }

  return (
    <Button size="sm" onClick={onClick} disabled={pending}>
      {pending ? "Saving…" : "Mark as paid"}
    </Button>
  );
}