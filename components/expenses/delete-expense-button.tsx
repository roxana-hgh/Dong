"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteExpense } from "@/actions/expenses";
import { Button } from "@/components/ui/button";

export function DeleteExpenseButton({ groupId, expenseId, title }: { groupId: string; expenseId: string; title: string }) {
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (!window.confirm(`Delete "${title}"?`)) return;
    startTransition(async () => {
      const res = await deleteExpense({ groupId, expenseId });
      if (!res.ok) toast.error(res.error);
      else toast.success("Expense deleted");
    });
  }

  return (
    <Button variant="ghost" size="icon" aria-label={`Delete ${title}`} disabled={pending} onClick={onClick}>
      <Trash2 className="size-4" />
    </Button>
  );
}