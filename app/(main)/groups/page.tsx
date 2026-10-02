import Link from "next/link";
import { Plus } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { getGroupsSummary } from "@/lib/group-financials";
import { GroupCard } from "@/components/groups/group-card";

export default async function GroupsPage() {
  const user = await getCurrentUser();
  const groups = user ? await getGroupsSummary(user.id) : [];


  return (
    <div className="space-y-6">
    
     <section aria-labelledby="groups-heading" className="space-y-3">
        <h2 id="groups-heading" className="font-semibold">
          Your groups <span className="text-muted-foreground">({groups.length})</span>
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {groups.map((g) => <GroupCard key={g.id} group={g} />)}
          <Link
            href="/groups/new"
            className="grid min-h-40 place-items-center rounded-2xl border border-dashed border-border text-muted-foreground transition-colors hover:border-primary/60 hover:bg-card hover:text-primary"
          >
            <span className="flex flex-col items-center gap-2 text-sm font-medium">
              <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary">
                <Plus className="size-4" aria-hidden />
              </span>
              Create new group
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}