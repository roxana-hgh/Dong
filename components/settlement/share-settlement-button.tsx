"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ShareSettlementButton({ title, lines }: { title: string; lines: string[] }) {
  async function onClick() {
    const text = [title, ...lines].join("\n");
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title, text });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return; // user closed the share sheet
      toast.error("Couldn't share. Try again.");
    }
  }

  return (
    <Button variant="outline" onClick={onClick} disabled={lines.length === 0}>
      <Share2 className="size-4" aria-hidden /> Share settlement
    </Button>
  );
}