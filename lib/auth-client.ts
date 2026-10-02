import { createAuthClient } from "better-auth/react";
import { anonymousClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({ plugins: [anonymousClient()] });

/** Makes sure a session exists; creates a guest session if the visitor has none. */
export async function ensureSession(): Promise<boolean> {
  const { data } = await authClient.getSession();
  if (data) return true;
  const res = await authClient.signIn.anonymous();
  return !res.error;
}