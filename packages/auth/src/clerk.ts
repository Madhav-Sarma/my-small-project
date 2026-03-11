import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

export interface ClerkJWTPayload extends JWTPayload {
  sub: string;         // Clerk user ID
  org_id?: string;     // Organization ID
  org_role?: string;   // Role within organization
  org_slug?: string;   // Organization slug
  email?: string;
}

const CLERK_PUBLISHABLE_KEY = process.env["CLERK_PUBLISHABLE_KEY"] ?? "";
const CLERK_SECRET_KEY = process.env["CLERK_SECRET_KEY"] ?? "";

// Extract the Clerk frontend API domain from the publishable key
// Publishable key format: pk_test_<base64encoded>
function getClerkIssuerDomain(): string {
  if (!CLERK_PUBLISHABLE_KEY) {
    throw new Error("CLERK_PUBLISHABLE_KEY is not set");
  }

  // The publishable key encodes the frontend API domain
  const encoded = CLERK_PUBLISHABLE_KEY.replace(/^pk_(test|live)_/, "");
  const decoded = Buffer.from(encoded, "base64").toString("utf-8").replace(/\$$/, "");
  return `https://${decoded}`;
}

let _jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJWKS(): ReturnType<typeof createRemoteJWKSet> {
  if (!_jwks) {
    const issuerDomain = getClerkIssuerDomain();
    _jwks = createRemoteJWKSet(new URL(`${issuerDomain}/.well-known/jwks.json`));
  }
  return _jwks;
}

/**
 * Verify a Clerk JWT and return its decoded payload.
 */
export async function verifyToken(token: string): Promise<ClerkJWTPayload> {
  const jwks = getJWKS();

  const { payload } = await jwtVerify(token, jwks, {
    // Clerk tokens use the frontend API domain as the issuer
    issuer: getClerkIssuerDomain(),
  });

  if (!payload.sub) {
    throw new Error("Token missing subject (sub) claim");
  }

  return payload as ClerkJWTPayload;
}

/**
 * Check if the Clerk secret key is configured.
 * Used by backend API calls to Clerk for user/org management.
 */
export function isClerkConfigured(): boolean {
  return Boolean(CLERK_PUBLISHABLE_KEY && CLERK_SECRET_KEY);
}

/**
 * Get the Clerk secret key for backend API calls.
 */
export function getClerkSecretKey(): string {
  if (!CLERK_SECRET_KEY) {
    throw new Error("CLERK_SECRET_KEY is not set");
  }
  return CLERK_SECRET_KEY;
}
