import { Receipt, Users } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { UserAvatar } from "@/components/shared/user-avatar";
import { DeleteExpenseButton } from "./delete-expense-button";

type ExpenseRow = {
  id: string;
  title: string;
  amountMinor: number;
  category: string;
  date: Date;
  createdById: string;
  paidBy: { displayName: string };
  _count: { shares: number };
};

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" });
const label = (c: string) => c.charAt(0) + c.slice(1).toLowerCase();

export function ExpenseList({
  expenses,
  groupId,
  currentMember,
}: {
  expenses: ExpenseRow[];
  groupId: string;
  currentMember: { id: string; role: string };
}) {
  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
          <Receipt className="size-5" aria-hidden />
        </span>
        <p className="text-sm text-muted-foreground">No expenses yet.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border/60">
      {expenses.map((e) => {
        const canDelete = currentMember.role === "OWNER" || e.createdById === currentMember.id;
        return (
          <li key={e.id} className="group flex items-center gap-3 py-3">
            <UserAvatar name={e.paidBy.displayName} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{e.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {dateFormat.format(e.date)} · {label(e.category)} · {e.paidBy.displayName} paid
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold tabular-nums">{formatMoney(e.amountMinor)}</p>
              <p className="flex items-center justify-end gap-1 text-[11px] text-muted-foreground">
                <Users className="size-3" aria-hidden />
                {e._count.shares} {e._count.shares === 1 ? "person" : "people"}
              </p>
            </div>
            {canDelete && (
              <DeleteExpenseButton
                groupId={groupId}
                expenseId={e.id}
                title={e.title}
                className=" focus-visible:opacity-100"
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}