"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteExpense } from "@/actions/expenses";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { cn } from "@/lib/utils";

export function DeleteExpenseButton({
  groupId,
  expenseId,
  title,
  className,
}: {
  groupId: string;
  expenseId: string;
  title: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function onConfirm() {
    startTransition(async () => {
      const res = await deleteExpense({ groupId, expenseId });
      if (!res.ok) toast.error(res.error);
      else toast.success("Expense deleted");
      setOpen(false);
    });
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Delete ${title}`}
        onClick={() => setOpen(true)}
        className={cn("size-8 text-muted-foreground hover:text-destructive", className)}
      >
        <Trash2 className="size-4" />
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete expense?"
        description={`"${title}" will be removed and everyone's balances will be recalculated.`}
        confirmLabel="Delete"
        destructive
        pending={pending}
        onConfirm={onConfirm}
      />
    </>
  );
}