import { getCurrentUser } from "@/lib/session";
import { CreateGroupForm } from "@/components/groups/create-group-form";

export default async function NewGroupPage() {
  const user = await getCurrentUser();
  // Guests get an auto-generated name, so we don't prefill it for them.
  const defaultName = user && !user.isAnonymous ? user.name : "";

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-xl font-semibold">Create a group</h1>
      <CreateGroupForm defaultName={defaultName} />
    </div>
  );
}