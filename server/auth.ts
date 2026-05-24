"use server";
import * as bcrypt from "bcrypt-ts";
import { cookies } from "next/headers";
import { generateJWT } from "./jwt";
import { getPayload } from "./jwt";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { generate } from "random-words";
import { sendResetEmail } from "./mail/mail";

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

export async function resetJWT(payload?: Omit<JWTPayload, "v">) {
  if (!payload) {
    const current = await getPayload();
    const userid = current?._id;
    if (!userid) throw new Error("User not found");

    const user = await fetchQuery(
      api.self.get,
      { userID: userid as Id<"users"> },
      {
        token: process.env.SERVER_JWT!,
      },
    );

    if (!user) throw new Error("User not found");
    // Keep the currently active team selected if the user is still a member,
    // otherwise fall back to their first team.
    const activeTeamID =
      current?.activeTeamID &&
      user.teams.some((t) => t.teamID === current.activeTeamID)
        ? current.activeTeamID
        : user.teams[0]?.teamID;
    payload = {
      _id: user._id,
      name: user.name,
      teams: user.teams,
      activeTeamID,
    };
  }
  if (!payload) throw new Error("User not found");
  const cookie = await cookies();
  cookie.set("jwt", await generateJWT(payload), {
    httpOnly: true,
    expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
  });
}

export async function login(name: string, password: string) {
  const user = await fetchQuery(
    api.auth.getUserFromName,
    { name },
    {
      token: process.env.SERVER_JWT!,
    },
  );
  if (!user) {
    console.debug("User not found during login for name:", name);
    return null;
  }
  // hash password and compare with db password
  const isValid = await bcrypt.compare(password, user.hashedPassword);
  if (!isValid) return null;
  // Update last login time
  await fetchMutation(
    api.auth.updateLastLogin,
    { userID: user._id },
    {
      token: process.env.SERVER_JWT!,
    },
  );
  await resetJWT({ ...user, activeTeamID: user.teams[0]?.teamID });
  return user;
}

// Switches which team is active by re-issuing the JWT with a new activeTeamID.
// All team-scoped Convex queries read the team from the JWT, so this is all
// that's needed server-side. The caller should reload the page afterwards so
// the Convex client picks up the new token.
export async function switchTeam(teamID: string) {
  const current = await getPayload();
  if (!current) throw new Error("Not authenticated");

  const user = await fetchQuery(
    api.self.get,
    { userID: current._id as Id<"users"> },
    { token: process.env.SERVER_JWT! },
  );
  if (!user) throw new Error("User not found");
  if (!user.teams.some((t) => t.teamID === teamID)) {
    throw new Error("You are not a member of this team");
  }

  await resetJWT({
    _id: user._id,
    name: user.name,
    teams: user.teams,
    activeTeamID: teamID,
  });
  return true;
}

// Creates a new team owned by the currently logged-in user and makes it active.
export async function createTeamForCurrentUser(teamName: string) {
  const current = await getPayload();
  if (!current) throw new Error("Not authenticated");

  const result = await fetchMutation(
    api.auth.createTeam,
    { teamName, userID: current._id as Id<"users"> },
    { token: process.env.SERVER_JWT! },
  );
  if (result.error || !result.teamID) {
    throw new Error(result.error ?? "Failed to create team");
  }
  const teamID = result.teamID;

  const user = await fetchQuery(
    api.self.get,
    { userID: current._id as Id<"users"> },
    { token: process.env.SERVER_JWT! },
  );
  if (!user) throw new Error("User not found");

  await resetJWT({
    _id: user._id,
    name: user.name,
    teams: user.teams,
    activeTeamID: teamID,
  });
  return { teamID };
}

// Removes the current user from a team. Throws (via the mutation) if they are
// the last admin — they must delete the team instead.
export async function leaveTeam(teamID: string) {
  const current = await getPayload();
  if (!current) throw new Error("Not authenticated");

  await fetchMutation(
    api.team.leaveTeam,
    { userID: current._id as Id<"users">, teamID: teamID as Id<"teams"> },
    { token: process.env.SERVER_JWT! },
  );

  // Refresh the JWT so the left team disappears from the switcher; resetJWT
  // re-points activeTeamID if it was the team we just left.
  await resetJWT();
}

// Permanently deletes a team (admin only) and refreshes the current user's JWT.
export async function deleteTeam(teamID: string) {
  const current = await getPayload();
  if (!current) throw new Error("Not authenticated");

  await fetchMutation(
    api.team.deleteTeam,
    { userID: current._id as Id<"users">, teamID: teamID as Id<"teams"> },
    { token: process.env.SERVER_JWT! },
  );

  await resetJWT();
}

// Looks up which team an invite key belongs to (for the accept-invite page).
export async function getInviteInfo(inviteKey: string) {
  return fetchQuery(
    api.team.getInviteInfo,
    { inviteKey },
    { token: process.env.SERVER_JWT! },
  );
}

// Adds the currently logged-in user to the team an invite key points to and
// makes that team active.
export async function acceptInvite(inviteKey: string) {
  const current = await getPayload();
  if (!current) throw new Error("Not authenticated");

  const { teamID } = await fetchMutation(
    api.auth.joinTeamWithInvite,
    { userID: current._id as Id<"users">, inviteKey },
    { token: process.env.SERVER_JWT! },
  );

  const user = await fetchQuery(
    api.self.get,
    { userID: current._id as Id<"users"> },
    { token: process.env.SERVER_JWT! },
  );
  if (!user) throw new Error("User not found");

  await resetJWT({
    _id: user._id,
    name: user.name,
    teams: user.teams,
    activeTeamID: teamID,
  });
  return { teamID };
}

export async function createTeam(input: {
  teamName: string;
  username: string;
  email?: string;
  password: string;
}) {
  try {
    const { teamName, username, email, password } = input;

    const hashedPassword = await hashPassword(password);

    const status = await fetchMutation(
      api.auth.createTeam,
      { teamName, name: username, email, password: hashedPassword },
      {
        token: process.env.SERVER_JWT!,
      },
    );
    return status;
  } catch (error) {
    console.error("Signup error:", error);
    return { error: "Internal server error" };
  }
}

export async function register(input: {
  name: string;
  email?: string;
  password: string;
  invite_key: string;
}) {
  const hashedPassword = await hashPassword(input.password);

  await fetchMutation(
    api.auth.registerToTeam,
    {
      name: input.name,
      email: input.email,
      password: hashedPassword,
      inviteKey: input.invite_key,
    },
    {
      token: process.env.SERVER_JWT!,
    },
  );
}

export async function logout() {
  (await cookies()).delete("jwt");
  return true;
}

export async function requestResetPassword(email: string) {
  const user = await fetchQuery(
    api.auth.getUserFromName,
    { name: email },
    {
      token: process.env.SERVER_JWT!,
    },
  );
  if (!user) return true;
  const token = generate({ exactly: 5, join: "-" });
  const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();
  await fetchMutation(
    api.auth.createResetToken,
    { userID: user._id, token, expiresAt },
    {
      token: process.env.SERVER_JWT!,
    },
  );
  // Send email with reset link
  await sendResetEmail(email, token);
  return true;
}

export async function resetPassword(
  email: string,
  token: string,
  newPassword: string,
) {
  const user = await fetchQuery(
    api.auth.getUserFromName,
    { name: email },
    {
      token: process.env.SERVER_JWT!,
    },
  );
  if (!user) return true;
  const hashedPassword = await hashPassword(newPassword);
  const result = await fetchMutation(
    api.auth.checkResetToken,
    { userID: user._id, token, newPassword: hashedPassword },
    {
      token: process.env.SERVER_JWT!,
    },
  );

  return result;
}

export async function changePassword(oldPassword: string, newPassword: string) {
  const payload = await getPayload();
  const user = await fetchQuery(
    api.self.get,
    { userID: payload?._id as Id<"users"> },
    {
      token: process.env.SERVER_JWT!,
    },
  );
  if (!user) {
    return "User not found";
  }
  // hash password and compare with db password
  const isValid = await bcrypt.compare(oldPassword, user.hashedPassword!);

  if (!isValid) {
    return "Old password is incorrect";
  }

  const hashedNewPassword = await hashPassword(newPassword);

  await fetchMutation(
    api.auth.setPasswordOfUser,
    { userID: payload?._id as Id<"users">, newPassword: hashedNewPassword },
    {
      token: process.env.SERVER_JWT!,
    },
  );
}
