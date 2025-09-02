import { authHandler } from "encore.dev/auth";
import { Header, APIError } from "encore.dev/api";
import { SQLDatabase } from "encore.dev/storage/sqldb";
import { secret } from "encore.dev/config";
import { createHash, randomBytes, timingSafeEqual } from "crypto";

const jwtSecret = secret("JWTSecret");
const authDB = SQLDatabase.named("auth");

interface AuthParams {
  authorization?: Header<"Authorization">;
}

export interface AuthData {
  userID: string;
  email: string;
  name: string;
}

function hashPassword(password: string, salt: string): string {
  return createHash('sha256').update(password + salt).digest('hex');
}

function generateSalt(): string {
  return randomBytes(32).toString('hex');
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  const computedHash = hashPassword(password, salt);
  return timingSafeEqual(Buffer.from(hash), Buffer.from(computedHash));
}

function generateToken(userID: string): string {
  const payload = {
    userID,
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
  };
  
  // Simple token format: base64(payload).signature
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = createHash('sha256').update(payloadStr + jwtSecret()).digest('hex');
  return `${payloadStr}.${signature}`;
}

function verifyToken(token: string): { userID: string } | null {
  try {
    const [payloadStr, signature] = token.split('.');
    if (!payloadStr || !signature) return null;
    
    // Verify signature
    const expectedSignature = createHash('sha256').update(payloadStr + jwtSecret()).digest('hex');
    if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }
    
    // Parse payload
    const payload = JSON.parse(Buffer.from(payloadStr, 'base64').toString());
    
    // Check expiration
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return { userID: payload.userID };
  } catch {
    return null;
  }
}

const auth = authHandler<AuthParams, AuthData>(
  async (params) => {
    const token = params.authorization?.replace("Bearer ", "");
    if (!token) {
      throw APIError.unauthenticated("missing token");
    }

    const tokenData = verifyToken(token);
    if (!tokenData) {
      throw APIError.unauthenticated("invalid token");
    }

    const user = await authDB.queryRow<{
      id: string;
      email: string;
      name: string;
    }>`
      SELECT id, email, name
      FROM auth_users
      WHERE id = ${tokenData.userID}
    `;

    if (!user) {
      throw APIError.unauthenticated("user not found");
    }

    return {
      userID: user.id,
      email: user.email,
      name: user.name,
    };
  }
);

export { auth, hashPassword, generateSalt, verifyPassword, generateToken, verifyToken };
