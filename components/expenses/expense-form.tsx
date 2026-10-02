"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createExpense } from "@/actions/expenses";
import { formatMoney, parseMoneyToMinor } from "@/lib/money";
import { resolveSplitFromForm } from "@/lib/splits";
import { cn } from "@/lib/utils";
import { CATEGORIES, SPLIT_TYPES, expenseSchema, type ExpenseInput } from "@/validators/expense";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Props = {
  groupId: string;
  members: { id: string; displayName: string }[];
  currentMemberId: string;
  today: string;
};

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="text-sm text-destructive">{message}</p> : null;
const pretty = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

export function ExpenseForm({ groupId, members, currentMemberId, today }: Props) {
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseInput>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      groupId,
      title: "",
      amount: "",
      paidById: currentMemberId,
      category: "OTHER",
      date: today,
      note: "",
      splitType: "EQUAL",
      participants: members.map((m) => ({ memberId: m.id, included: true, value: "" })),
    },
  });
  const { fields } = useFieldArray({ control, name: "participants" });

  const splitType = useWatch({ control, name: "splitType" });
  const amount = useWatch({ control, name: "amount" });
  const participants = useWatch({ control, name: "participants" });

  // Live preview uses the SAME pure function as the server action.
  const preview = useMemo(() => {
    const total = parseMoneyToMinor(amount ?? "");
    if (total === null || total <= 0) return null;
    return resolveSplitFromForm(total, splitType, participants);
  }, [amount, splitType, participants]);
  const shareById = new Map(preview?.ok ? preview.shares.map((s) => [s.memberId, s.shareMinor] as const) : []);

  function changeSplitType(next: ExpenseInput["splitType"]) {
    setValue("splitType", next);
    fields.forEach((_, i) => setValue(`participants.${i}.value`, ""));
  }

  const onSubmit = handleSubmit(async (values) => {
    const res = await createExpense(values);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("Expense added");
    router.push(`/groups/${groupId}/expenses`);
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <Card className="rounded-2xl">
        <CardContent className="space-y-5 pt-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Dinner" {...register("title")} />
            <FieldError message={errors.title?.message} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input id="amount" inputMode="decimal" placeholder="0.00" className="pl-7" {...register("amount")} />
              </div>
              <FieldError message={errors.amount?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paidById">Paid by</Label>
              <Controller
                control={control}
                name="paidById"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="paidById" className="w-full"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {members.map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.displayName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.paidById?.message} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <Button
                      key={c}
                      type="button"
                      size="sm"
                      variant={field.value === c ? "default" : "outline"}
                      aria-pressed={field.value === c}
                      onClick={() => field.onChange(c)}
                    >
                      {pretty(c)}
                    </Button>
                  ))}
                </div>
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" {...register("date")} />
              <FieldError message={errors.date?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Note (optional)</Label>
              <Input id="note" {...register("note")} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label>Split</Label>
            <div className="inline-flex rounded-lg border p-1" role="group" aria-label="Split type">
              {SPLIT_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={splitType === t}
                  onClick={() => changeSplitType(t)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    splitType === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t === "EXACT" ? "Exact amount" : pretty(t)}
                </button>
              ))}
            </div>
          </div>

          <ul className="divide-y">
            {fields.map((field, i) => {
              const name = members.find((m) => m.id === field.memberId)?.displayName ?? "";
              const included = participants?.[i]?.included ?? true;
              const share = shareById.get(field.memberId);
              return (
                <li key={field.id} className="flex items-center gap-3 py-2">
                  <Checkbox
                    id={`participant-${i}`}
                    checked={included}
                    onCheckedChange={(v) => setValue(`participants.${i}.included`, v === true, { shouldValidate: true })}
                  />
                  <Label htmlFor={`participant-${i}`} className="flex-1">{name}</Label>
                  {included && splitType !== "EQUAL" && (
                    <div className="relative w-28">
                      <Input
                        inputMode="decimal"
                        aria-label={`${name} ${splitType === "PERCENTAGE" ? "percentage" : "amount"}`}
                        className="pr-7 text-right"
                        {...register(`participants.${i}.value`)}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        {splitType === "PERCENTAGE" ? "%" : "$"}
                      </span>
                    </div>
                  )}
                  <span className="w-20 text-right text-sm tabular-nums text-muted-foreground">
                    {included && share !== undefined ? formatMoney(share) : "—"}
                  </span>
                </li>
              );
            })}
          </ul>

          <FieldError message={errors.participants?.root?.message ?? errors.participants?.message} />
          {preview && !preview.ok && <p className="text-sm text-destructive">{preview.error}</p>}
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : "Add expense"}
      </Button>
    </form>
  );
}