export type SessionUser = {
  name: string;
  email: string;
  image?: string | null;
};

// TODO: replace with the Better Auth session lookup.
// Return null to preview the guest UI.
export async function getSessionUser(): Promise<SessionUser | null> {
  return { name: "Roxana", email: "roxana@example.com", image: null };
}