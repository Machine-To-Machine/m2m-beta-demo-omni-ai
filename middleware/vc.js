import { VerifiableCredential } from "@web5/credentials";

export const verifyToken = async (req, res, next) => {
  try {
    const { vcJwt, timestamp } = req.body;

    // Check for required fields
    if (!vcJwt) {
      return res.status(401).json({ message: "Missing authentication token" });
    }

    // Verify timestamp (prevent replay attacks)
    const now = new Date().getTime();
    const MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes

    if (!timestamp || typeof timestamp !== 'number') {
      return res.status(401).json({ message: "Invalid timestamp" });
    }

    if (now - timestamp > MAX_AGE_MS || timestamp > now + 60000) {
      return res.status(401).json({ message: "Request timeout or invalid timestamp" });
    }

    // Verify the credential
    try {
      const vc = await VerifiableCredential.verify({ vcJwt });
      if (!vc) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Add verified credential to request for later use
      req.verifiedCredential = vc;
      next();
    } catch (verificationError) {
      return res.status(401).json({ message: "Credential verification failed" });
    }
  } catch (err) {
    // Avoid leaking error details to client
    console.error("VC verification error:", err.name || "Unknown error");
    return res.status(500).json({ message: "Authentication error" });
  }
};
