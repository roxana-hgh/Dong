import { ExpenseForm } from "@/components/expenses/expense-form";
import { db } from "@/lib/db";
import { requireGroupMember } from "@/lib/session";


export default async function NewExpensePage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const { member } = await requireGroupMember(groupId);

  const members = await db.groupMember.findMany({
    where: { groupId },
    orderBy: { joinedAt: "asc" },
    select: { id: true, displayName: true },
  });

  return (
    <div className="mx-auto max-w-2xl">
      <ExpenseForm
        groupId={groupId}
        members={members}
        currentMemberId={member.id}
        today={new Date().toISOString().slice(0, 10)}
      />
    </div>
  );
}