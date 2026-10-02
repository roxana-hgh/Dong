import { DeleteExpenseButton } from "@/components/expenses/delete-expense-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatMoney } from "@/lib/money";

type ExpenseRow = {
  id: string;
  title: string;
  amountMinor: number;
  category: string;
  date: Date;
  createdById: string;
  paidBy: { displayName: string };
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
      <Card className="rounded-2xl">
        <CardContent className="py-10 text-center text-muted-foreground">No expenses yet.</CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl">
      <CardContent className="divide-y p-0">
        {expenses.map((e) => {
          const canDelete = currentMember.role === "OWNER" || e.createdById === currentMember.id;
          return (
            <div key={e.id} className="flex items-center gap-3 px-6 py-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{e.title}</p>
                <p className="text-sm text-muted-foreground">
                  {e.paidBy.displayName} paid · {dateFormat.format(e.date)}
                </p>
              </div>
              <Badge variant="secondary">{label(e.category)}</Badge>
              <span className="w-24 text-right font-semibold tabular-nums">{formatMoney(e.amountMinor)}</span>
              {canDelete && <DeleteExpenseButton groupId={groupId} expenseId={e.id} title={e.title} />}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}