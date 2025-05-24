"use server";
import * as jwt from "jose";
import db from "../db/db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

// These should be set as environment variables in your deployment platform
const JWT_PRIVATE_KEY = process.env.JWT_PRIVATE_KEY;
const JWT_PUBLIC_KEY = process.env.JWT_PUBLIC_KEY;

const privateKeyStr = JWT_PRIVATE_KEY!;
const publicKeyStr = JWT_PUBLIC_KEY!;

let publicKey: CryptoKey | null = null;
let privateKey: CryptoKey | null = null;

async function loadKeys() {
  try {
    publicKey = publicKey ?? (await jwt.importSPKI(publicKeyStr, "RS256"));
    privateKey = privateKey ?? (await jwt.importPKCS8(privateKeyStr, "RS256"));
  } catch (error) {
    console.error("Error loading JWT keys:", error);
    throw new Error(
      "Failed to load JWT keys. Please ensure your keys are in the correct PEM format."
    );
  }
}

// Load keys when the module is imported
loadKeys().catch((error) => {
  console.error("Failed to initialize JWT keys:", error);
});

export async function verifyJWT(token: string) {
  if (!token) return null;
  if (!publicKey) {
    throw new Error("JWT public key not initialized");
  }
  try {
    const decoded = await jwt.jwtVerify<JWTPayload>(token, publicKey, {
      algorithms: ["RS256"],
    });
    return decoded.payload;
  } catch (_) {
    return null;
  }
}

export async function generateJWT(user: JWTPayload) {
  if (!privateKey) {
    throw new Error("JWT private key not initialized");
  }
  const token = await new jwt.SignJWT({
    id: user.id,
    name: user.name,
    teamID: user.teamID,
    isAdmin: user.isAdmin,
  })
    .setProtectedHeader({ alg: "RS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(privateKey);
  return token;
}
