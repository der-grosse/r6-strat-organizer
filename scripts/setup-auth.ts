import * as jwt from "jose";
import * as fs from "fs/promises";
import * as path from "path";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function setupAuth() {
  try {
    console.log("Starting auth setup...");

    // 1. Generate RSA Key Pair
    console.log("Generating RSA key pair...");
    const { publicKey, privateKey } = await jwt.generateKeyPair("RS256", {
      extractable: true,
    });

    // Export keys to PEM format
    const publicKeyPem = await jwt.exportSPKI(publicKey);
    const privateKeyPem = await jwt.exportPKCS8(privateKey);

    // Save keys to files (optional but good for backup)
    const dataDir = path.join(process.cwd(), "keys");
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(path.join(dataDir, "public.pem"), publicKeyPem);
    await fs.writeFile(path.join(dataDir, "private.pem"), privateKeyPem);
    console.log("Keys saved to keys/ directory.");

    // 2. Generate Server JWT
    console.log("Generating Server JWT...");
    const serverToken = await new jwt.SignJWT({
      v: "2.0",
      _id: "NEXTJS_SERVER_JWT",
      name: "NEXTJS_SERVER",
      teams: [],
    })
      .setSubject("NEXTJS_SERVER_JWT")
      .setProtectedHeader({ alg: "RS256", kid: "r6-strats-key-1" })
      .setAudience("r6-strats")
      .setIssuer("https://r6-strats.com")
      .setIssuedAt()
      .setExpirationTime(
        new Date(new Date().setFullYear(new Date().getFullYear() + 100)),
      )
      .sign(privateKey);

    // 3. Generate JWKS
    console.log("Generating JWKS...");
    const jwk = await jwt.exportJWK(publicKey);
    const jwks = {
      keys: [
        {
          ...jwk,
          alg: "RS256",
          key_ops: ["verify"],
          kid: "r6-strats-key-1",
          use: "sig",
        },
      ],
    };
    const jwksString = JSON.stringify(jwks, null, 2);

    // Write the JWKS to the public endpoint used by Convex.
    const jwksPath = path.join(
      process.cwd(),
      "public",
      ".well-known",
      "jwks.json",
    );
    await fs.mkdir(path.dirname(jwksPath), { recursive: true });
    await fs.writeFile(jwksPath, jwksString, { encoding: "utf8" });

    // 4. Update .env file
    console.log("Updating .env file...");
    const envPath = path.join(process.cwd(), ".env");

    let envContents = "";
    try {
      envContents = await fs.readFile(envPath, { encoding: "utf8" });
    } catch (e: any) {
      if (e.code !== "ENOENT") throw e;
      envContents = "";
    }

    // Helper to set or replace a key in env contents
    function setEnvValue(contents: string, key: string, value: string) {
      const regex = new RegExp(`(^${key}=).*`, "m");
      if (regex.test(contents)) {
        return contents.replace(regex, `$1${value}`);
      }
      const prefix = contents && !contents.endsWith("\n") ? "\n" : "";
      return contents + prefix + `${key}=${value}\n`;
    }

    // Escape newlines for PEM keys to keep them on one line in .env
    const publicKeyEscaped = '"' + publicKeyPem.replace(/\r?\n/g, "\\n") + '"';
    const privateKeyEscaped =
      '"' + privateKeyPem.replace(/\r?\n/g, "\\n") + '"';
    const serverJwtValue = `"${serverToken}"`;

    envContents = setEnvValue(envContents, "JWT_PUBLIC_KEY", publicKeyEscaped);
    envContents = setEnvValue(
      envContents,
      "JWT_PRIVATE_KEY",
      privateKeyEscaped,
    );
    envContents = setEnvValue(envContents, "SERVER_JWT", serverJwtValue);

    await fs.writeFile(envPath, envContents, { encoding: "utf8" });

    console.log("----------------------------------------");
    console.log("✅ Auth setup complete!");
    console.log("----------------------------------------");
    console.log("Updated .env with:");
    console.log("- JWT_PUBLIC_KEY");
    console.log("- JWT_PRIVATE_KEY");
    console.log("- SERVER_JWT");
    console.log("----------------------------------------");
  } catch (error) {
    console.error("Error setting up auth:", error);
    process.exit(1);
  }
}

setupAuth();
