// app/(main)/friends/page.tsx
import Link from "next/link";
import { UserRound } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { getFriendsData } from "@/lib/friends";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FriendsView } from "@/components/friends/friends-view";

export default async function FriendsPage() {
  const user = await getCurrentUser();

  if (!user || user.isAnonymous) {
    return (
      <Card className="mx-auto max-w-md rounded-2xl">
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
            <UserRound className="size-6" aria-hidden />
          </div>
          <h1 className="text-lg font-semibold">Keep your people close</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to save the people you split with most, and add them to any group in one tap.
          </p>
          <Button asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { friends, lists } = await getFriendsData(user.id);
  return <FriendsView friends={friends} lists={lists} />;
}