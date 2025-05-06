import jwt from "jsonwebtoken";

export function generateJWT(user: JWTPayload) {
  const token = jwt.sign(
    {
      id: user.id,
      name: user.name,
      teamID: user.teamID,
      isAdmin: user.isAdmin,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    },
    process.env.PRIVATE_KEY!,
    { algorithm: "RS256" }
  );
  return token;
}
