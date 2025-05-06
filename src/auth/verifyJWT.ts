import jwt from "jsonwebtoken";

export async function verifyJWT(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.PUBLIC_KEY!, {
      algorithms: ["RS256"],
    });
    return decoded as JWTPayload;
  } catch (err) {
    console.error("JWT verification failed:", err);
    return null;
  }
}
