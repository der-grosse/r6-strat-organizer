import { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      type: "customJwt",
      applicationID: "r6-strats",
      issuer: "https://r6-strats.com",
      jwks: "https://r6-strats.com/.well-known/jwks.json",
      algorithm: "RS256",
    },
  ],
} as AuthConfig;
