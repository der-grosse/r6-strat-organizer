import * as jwt from "jose";
import * as fs from "fs/promises";
import * as path from "path";

async function generateKeys() {
  try {
    // Generate key pair
    const keys = await jwt.generateKeyPair("RS256", { extractable: true });

    // Export keys
    const publicKey = await jwt.exportSPKI(keys.publicKey);
    const privateKey = await jwt.exportPKCS8(keys.privateKey);

    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), "data");
    await fs.mkdir(dataDir, { recursive: true });

    // Save keys to files
    await fs.writeFile(path.join(dataDir, "public.pem"), publicKey);
    await fs.writeFile(path.join(dataDir, "private.pem"), privateKey);

    console.info("Keys generated and saved successfully!");
    console.info("Public key saved to: data/public.pem");
    console.info("Private key saved to: data/private.pem");
  } catch (error) {
    console.error("Error generating keys:", error);
    process.exit(1);
  }
}

generateKeys();
