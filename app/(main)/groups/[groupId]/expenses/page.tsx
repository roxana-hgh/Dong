import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { requireGroupMember } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { ExpenseList } from "@/components/expenses/expense-list";


export default async function ExpensesPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const { member } = await requireGroupMember(groupId);

  const expenses = await db.expense.findMany({
    where: { groupId },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    select: {
      id: true, title: true, amountMinor: true, category: true, date: true, createdById: true,
      paidBy: { select: { displayName: true } },
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button asChild>
          <Link href={`/groups/${groupId}/expenses/new`}><Plus className="size-4" /> Add expense</Link>
        </Button>
      </div>
      <ExpenseList expenses={expenses} groupId={groupId} currentMember={member} />
    </div>
  );
}