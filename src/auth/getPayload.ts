import { cookies } from "next/headers";
import { verifyJWT } from "./jwt";

export async function getPayload() {
  const token = (await cookies()).get("jwt")?.value;
  if (!token) return null;
  const payload = await verifyJWT(token);
  if (!payload) return null;
  return payload;
}
