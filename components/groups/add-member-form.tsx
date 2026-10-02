"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { addMember } from "@/actions/groups";
import { addMemberSchema, type AddMemberInput } from "@/validators/group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AddMemberForm({ groupId }: { groupId: string }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddMemberInput>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: { groupId, name: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    const res = await addMember(values);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("Member added");
    reset({ groupId, name: "" });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-2">
      <div className="flex gap-2">
        <Input aria-label="New member name" placeholder="Add someone by name" {...register("name")} />
        <Button type="submit" disabled={isSubmitting}>Add</Button>
      </div>
      {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
    </form>
  );
}