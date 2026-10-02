import { Users } from "lucide-react";
import { Surface } from "@/components/shared/surface";
import { GroupCover } from "./group-cover";
import { StatusPill } from "./status-pill";

export function GroupHeader({
  id,
  name,
  memberCount,
  children,
}: {
  id: string;
  name: string;
  memberCount: number;
  children?: React.ReactNode; // the tabs
}) {
  return (
    <Surface className="overflow-hidden">
      <GroupCover seed={id} className="h-28 sm:h-36">
        <div className="absolute inset-x-0 bottom-0 flex items-end gap-3 bg-gradient-to-t from-black/30 to-transparent px-4 pb-3.5 pt-10 text-white sm:px-5">
          <div
            aria-hidden
            className="grid size-12 shrink-0 place-items-center rounded-xl bg-white/20 text-lg font-semibold ring-1 ring-white/30 backdrop-blur"
          >
            {Array.from(name)[0]?.toUpperCase()}
          </div>
          <div className="min-w-0 pb-0.5">
            <h1 className="truncate text-xl font-semibold leading-tight sm:text-2xl">{name}</h1>
            <p className="flex items-center gap-1.5 text-xs text-white/85">
              <Users className="size-3.5" aria-hidden />
              {memberCount} members · USD
            </p>
          </div>
          <StatusPill className="ml-auto mb-1" />
        </div>
      </GroupCover>
      {children}
    </Surface>
  );
}