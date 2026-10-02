"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { joinGroup } from "@/actions/groups";
import { ensureSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  token: string;
  groupName: string;
  memberCount: number;
  claimable: { id: string; displayName: string }[];
};

const NEW = "__new__";

export function JoinForm({ token, groupName, memberCount, claimable }: Props) {
  const router = useRouter();
  const [choice, setChoice] = useState<string>(claimable.length > 0 ? claimable[0].id : NEW);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (choice === NEW && !name.trim()) {
      toast.error("Enter your name");
      return;
    }
    setSubmitting(true);
    try {
      if (!(await ensureSession())) {
        toast.error("Couldn't start a session. Please try again.");
        return;
      }
      const res = await joinGroup(
        choice === NEW ? { token, displayName: name.trim() } : { token, claimMemberId: choice },
      );
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      router.push(`/groups/${res.data.groupId}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Join “{groupName}”</CardTitle>
          <p className="text-sm text-muted-foreground">{memberCount} members already in</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <fieldset className="space-y-2">
            <legend className="mb-2 text-sm font-medium">Who are you?</legend>
            {claimable.map((m) => (
              <label key={m.id} className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 has-[:checked]:border-primary">
                <input type="radio" name="who" value={m.id} checked={choice === m.id} onChange={() => setChoice(m.id)} />
                I&apos;m {m.displayName}
              </label>
            ))}
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 has-[:checked]:border-primary">
              <input type="radio" name="who" value={NEW} checked={choice === NEW} onChange={() => setChoice(NEW)} />
              I&apos;m someone new
            </label>
          </fieldset>

          {choice === NEW && (
            <div className="space-y-2">
              <Label htmlFor="displayName">Your name</Label>
              <Input id="displayName" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Joining…" : "Join group"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}