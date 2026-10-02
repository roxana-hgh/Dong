import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { anonymous } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  // nextCookies must be the LAST plugin: it lets cookies be set from Server Actions
  plugins: [
    anonymous({
      // Runs when a guest signs in / registers with a real account.
      // We must move their data BEFORE Better Auth deletes the anonymous user.
      onLinkAccount: async ({ anonymousUser, newUser }) => {
        await db.$transaction([
          db.groupMember.updateMany({
            where: { userId: anonymousUser.user.id },
            data: { userId: newUser.user.id },
          }),
          db.group.updateMany({
            where: { createdById: anonymousUser.user.id },
            data: { createdById: newUser.user.id },
          }),
        ]);
      },
    }),
    nextCookies(), // must be the last plugin
  ],
});