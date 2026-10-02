"use client";

import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { createGroup } from "@/actions/groups";
import { ensureSession } from "@/lib/auth-client";
import { createGroupSchema, type CreateGroupInput } from "@/validators/group";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GroupCover } from "@/components/groups/group-cover";

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="text-sm text-destructive">{message}</p> : null;

export function CreateGroupForm({ defaultName }: { defaultName: string }) {
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateGroupInput>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: { name: "", yourName: defaultName, members: [{ name: "" }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "members" });

  const onSubmit = handleSubmit(async (values) => {
    // Guest-friendly: create an anonymous session first if the visitor isn't signed in.
    if (!(await ensureSession())) {
      toast.error("Couldn't start a session. Please try again.");
      return;
    }
    const res = await createGroup(values);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    router.push(`/groups/${res.data.groupId}`);
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <Card className="rounded-2xl">
        <div className="flex flex-col items-center gap-2">
          <GroupCover seed="new-group" className="grid size-24 place-items-center rounded-full">
            <Camera className="relative size-7 text-primary-foreground" aria-hidden />
          </GroupCover>
          <p className="text-xs text-muted-foreground">Cover photo (coming soon)</p>
        </div>
        <CardContent className="space-y-5 pt-6">
          <div className="space-y-2">
            <Label htmlFor="name">Group name</Label>
            <Input id="name" placeholder="Weekend trip" {...register("name")} />
            <FieldError message={errors.name?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="yourName">Your name</Label>
            <Input id="yourName" placeholder="Roxana" {...register("yourName")} />
            <FieldError message={errors.yourName?.message} />
          </div>

          <div className="space-y-2">
            <Label>Other people (you can add more later or share an invite link)</Label>
            {fields.map((field, i) => (
              <div key={field.id} className="flex gap-2">
                <Input
                  aria-label={`Member ${i + 1} name`}
                  placeholder="Name"
                  {...register(`members.${i}.name`)}
                />
                <Button type="button" variant="ghost" size="icon" aria-label="Remove" onClick={() => remove(i)}>
                  <X className="size-4" />
                </Button>
              </div>
            ))}
            {errors.members?.map?.((e, i) => <FieldError key={i} message={e?.name?.message} />)}
            <FieldError message={errors.members?.root?.message ?? errors.members?.message} />
            <Button type="button" variant="outline" size="sm" onClick={() => append({ name: "" })}>
              <Plus className="size-4" /> Add person
            </Button>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating…" : "Create group"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}