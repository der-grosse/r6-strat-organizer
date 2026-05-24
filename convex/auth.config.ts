import { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      type: "customJwt",
      applicationID: "r6-strats",
      issuer: "https://r6-strats.com",
      jwks: process.env.JWT_PUBLIC_JWKS!,
      algorithm: "RS256",
    },
  ],
} as AuthConfig;
