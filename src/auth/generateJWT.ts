import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

const PRIVATE_KEY = fs.readFileSync(
  path.join(process.cwd(), "data", "privateKey.pem"),
  "utf8"
);

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
    PRIVATE_KEY,
    { algorithm: "RS256" }
  );
  return token;
}
