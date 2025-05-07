import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

const PUBLIC_KEY = fs.readFileSync(
  path.join(process.cwd(), "data", "publicKey.pem"),
  "utf8"
);

export async function verifyJWT(token: string) {
  try {
    const decoded = jwt.verify(token, PUBLIC_KEY, {
      algorithms: ["RS256"],
    });
    return decoded as JWTPayload;
  } catch (err) {
    console.error("JWT verification failed:", err);
    return null;
  }
}
