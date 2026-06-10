import { getPayload } from "@/server/jwt";
import { getInviteInfo } from "@/server/auth";
import JoinTeamForm from "./JoinTeamForm";
import AcceptInvite from "./AcceptInvite";

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const rawKey = sp.inviteKey;
  const inviteKey = typeof rawKey === "string" ? rawKey : undefined;

  const payload = await getPayload();

  // Logged-in users accept the invite to join an additional team instead of
  // creating a brand-new account.
  if (payload) {
    const info = inviteKey ? await getInviteInfo(inviteKey) : null;
    return <AcceptInvite userName={payload.name} inviteKey={inviteKey} info={info} />;
  }

  // Logged-out visitors register a new account against the invite.
  return <JoinTeamForm />;
}
