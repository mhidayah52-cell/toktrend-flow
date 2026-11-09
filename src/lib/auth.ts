import crypto from "crypto";

const SESSION_SECRET =
  process.env.AUTH_SECRET || "toktrend-flow-local-dev-secret-key-2026";

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return false;
  const keyBuffer = Buffer.from(key, "hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  if (keyBuffer.length !== derivedKey.length) return false;
  return crypto.timingSafeEqual(keyBuffer, derivedKey);
}

export interface SessionUserPayload {
  id: string;
  email: string;
  name: string;
  role: string;
  planTier: string;
}

export function createSessionToken(user: SessionUserPayload): string {
  const payload = Buffer.from(JSON.stringify(user), "utf8").toString(
    "base64url"
  );
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string): SessionUserPayload | null {
  try {
    const [payload, signature] = token.split(".");
    if (!payload || !signature) return null;
    const expectedSig = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(payload)
      .digest("base64url");
    if (signature !== expectedSig) return null;
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );
    return decoded as SessionUserPayload;
  } catch {
    return null;
  }
}

export interface OtpTokenPayload {
  email: string;
  codeHash: string;
  expiresAt: number;
}

export function createOtpToken(email: string, otpCode: string): string {
  const normalizedEmail = email.trim().toLowerCase();
  const codeHash = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(`${normalizedEmail}:${otpCode.trim()}`)
    .digest("hex");
  const payloadObj: OtpTokenPayload = {
    email: normalizedEmail,
    codeHash,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
  };
  const payload = Buffer.from(JSON.stringify(payloadObj), "utf8").toString(
    "base64url"
  );
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyOtpToken(
  token: string,
  email: string,
  otpCode: string
): { valid: boolean; reason?: string } {
  try {
    const [payload, signature] = (token || "").split(".");
    if (!payload || !signature) {
      return {
        valid: false,
        reason: "Token verifikasi tidak ditemukan. Silakan minta kode baru.",
      };
    }
    const expectedSig = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(payload)
      .digest("base64url");
    if (signature !== expectedSig) {
      return { valid: false, reason: "Token verifikasi tidak valid." };
    }
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as OtpTokenPayload;

    const normalizedEmail = email.trim().toLowerCase();
    if (decoded.email !== normalizedEmail) {
      return {
        valid: false,
        reason: "Alamat email tidak sesuai dengan kode yang diminta.",
      };
    }
    if (Date.now() > decoded.expiresAt) {
      return {
        valid: false,
        reason: "Kode verifikasi sudah kedaluwarsa (lebih dari 10 menit).",
      };
    }

    const expectedCodeHash = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(`${normalizedEmail}:${otpCode.trim()}`)
      .digest("hex");

    if (decoded.codeHash !== expectedCodeHash) {
      return {
        valid: false,
        reason: "Kode verifikasi OTP yang Anda masukkan salah.",
      };
    }

    return { valid: true };
  } catch {
    return { valid: false, reason: "Gagal memverifikasi kode OTP." };
  }
}
