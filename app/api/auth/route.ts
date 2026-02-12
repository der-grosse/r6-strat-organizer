import { api } from "@/convex/_generated/api";
import { verifyJWT } from "@/server/jwt";
import { fetchQuery } from "convex/nextjs";

export async function GET(request: Request) {
  const jwt = request.headers.get("Authorization")?.split(" ")[1];

  if (!jwt) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Verify the JWT and extract user information
  const user = await verifyJWT(jwt);
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const team = await fetchQuery(api.team.get, {}, { token: jwt });

  if (!team) return new Response("No active team", { status: 403 });

  // Handle the authenticated request
  return Response.json({
    id: user._id,
    name: user.name,
    isAdmin: team?.isSelfAdmin,
    team: {
      name: team.name,
      members: team.members.map((member) => ({
        id: member._id,
        name: member.name,
        ubisoftID: member.ubisoftID,
        isAdmin: member.isAdmin,
      })),
    },
  });
}
