"use client";

import { useTransition } from "react";
import { Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { regenerateInviteToken } from "@/actions/groups";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function InviteLinkCard({ groupId, url, canRegenerate }: { groupId: string; url: string; canRegenerate: boolean }) {
  const [pending, startTransition] = useTransition();

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy. Select the link and copy it manually.");
    }
  }

  function regenerate() {
    if (!window.confirm("The old link will stop working. Continue?")) return;
    startTransition(async () => {
      const res = await regenerateInviteToken(groupId);
      if (!res.ok) toast.error(res.error);
      else toast.success("New link generated");
    });
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader><CardTitle>Invite link</CardTitle></CardHeader>
      <CardContent className="flex gap-2">
        <Input readOnly value={url} aria-label="Invite link" onFocus={(e) => e.currentTarget.select()} />
        <Button type="button" variant="outline" onClick={copy}><Copy className="size-4" /> Copy</Button>
        {canRegenerate && (
          <Button type="button" variant="ghost" size="icon" aria-label="Regenerate link" disabled={pending} onClick={regenerate}>
            <RefreshCw className="size-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}