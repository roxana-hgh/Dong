"use client";

import { useTransition } from "react";
import { Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { regenerateInviteToken } from "@/actions/groups";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Surface } from "@/components/shared/surface";

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
    <Surface className="space-y-2.5 px-5 py-4">
      <div>
        <h2 className="text-sm font-semibold">Invite link</h2>
        <p className="text-xs text-muted-foreground">Anyone with this link can join, even without an account.</p>
      </div>
      <div className="flex gap-2">
        <Input
          readOnly
          value={url}
          aria-label="Invite link"
          onFocus={(e) => e.currentTarget.select()}
          className="h-9 border-transparent bg-muted text-sm"
        />
        <Button type="button" size="sm" className="h-9" onClick={copy}>
          <Copy className="size-4" aria-hidden /> Copy
        </Button>
        {canRegenerate && (
          <Button type="button" variant="ghost" size="icon" className="size-9" aria-label="Regenerate link" disabled={pending} onClick={regenerate}>
            <RefreshCw className="size-4" />
          </Button>
        )}
      </div>
    </Surface>
  );
}