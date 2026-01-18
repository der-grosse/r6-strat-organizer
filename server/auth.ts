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
    const userid = (await getPayload())?._id;
    if (!userid) throw new Error("User not found");

    const user = await fetchQuery(
      api.self.get,
      { userID: userid as Id<"users"> },
      {
        token: process.env.SERVER_JWT!,
      },
    );

    if (!user) throw new Error("User not found");
    payload = {
      _id: user._id,
      name: user.name,
      teams: user.teams,
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
  // TODO: add selector for active team -> reload JWT with activeTeamID
  // TODO: handle what happens when user has no teams left
  await resetJWT({ ...user, activeTeamID: user.teams[0]?.teamID });
  return user;
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
