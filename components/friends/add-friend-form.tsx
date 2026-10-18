// components/friends/add-friend-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { addFriend } from "@/actions/friends";
import { friendNameSchema, type FriendNameInput } from "@/validators/friend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AddFriendForm({ listIds }: { listIds: string[] }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FriendNameInput>({
    resolver: zodResolver(friendNameSchema),
    defaultValues: { name: "" },
  });

  const onSubmit = handleSubmit(async ({ name }) => {
    const res = await addFriend({ name, listIds }); // if a list tab is active, the new friend joins it
    if (!res.ok) return void toast.error(res.error);
    reset({ name: "" });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-1.5">
      <div className="flex gap-2">
        <Input aria-label="Friend name" placeholder="Add a friend by name" {...register("name")} />
        <Button type="submit" disabled={isSubmitting}>
          <UserPlus className="size-4" aria-hidden /> Add
        </Button>
      </div>
      {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
    </form>
  );
}