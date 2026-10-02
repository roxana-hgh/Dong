import { Badge } from "@/components/ui/badge";
import { GroupCover } from "./group-cover";

export function GroupHeader({ id, name, memberCount }: { id: string; name: string; memberCount: number }) {
  return (
    <GroupCover seed={id} className="rounded-2xl px-5 py-6 sm:px-6 sm:py-8">
      <div className="relative flex items-center gap-4 text-primary-foreground">
        <div
          aria-hidden
          className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary-foreground/15 text-xl font-semibold backdrop-blur"
        >
          {Array.from(name)[0]?.toUpperCase()}
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold">{name}</h1>
          <p className="text-sm opacity-90">{memberCount} members · USD</p>
        </div>
        <Badge className="ml-auto bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20">
          Active
        </Badge>
      </div>
    </GroupCover>
  );
}