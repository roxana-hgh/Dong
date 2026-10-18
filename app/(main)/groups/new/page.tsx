import { getCurrentUser } from "@/lib/session";
import { CreateGroupForm } from "@/components/groups/create-group-form";
import { getFriendsData } from "@/lib/friends";

export default async function NewGroupPage() {
  const user = await getCurrentUser();

  const friendsData = user && !user.isAnonymous ? await getFriendsData(user.id) : null;
  // Guests get an auto-generated name, so we don't prefill it for them.
  const defaultName = user && !user.isAnonymous ? user.name : "";

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-xl font-semibold">Create a group</h1>
      <CreateGroupForm 
        defaultName={defaultName}
        friends={friendsData?.friends}
        friendLists={friendsData?.lists} />
    </div>
  );
}