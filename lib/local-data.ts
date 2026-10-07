export type ApplicationStatus = "draft" | "submitted" | "under_review" | "approved" | "rejected";
export type DocumentStatus = "required" | "uploaded" | "verified" | "rejected";
export type InquiryStatus = "open" | "in_progress" | "resolved";

export type LocalUser = {
  id: string;
  email: string;
  fullName: string;
  role: "member";
};

export type LocalApplication = {
  id: string;
  applicationNumber: string;
  applicationType: string;
  status: ApplicationStatus;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
  documents: LocalDocument[];
  events: LocalStatusEvent[];
};

export type LocalDocument = {
  id: string;
  documentType: string;
  fileName: string | null;
  status: DocumentStatus;
  uploadedAt: string | null;
};

export type LocalStatusEvent = {
  id: string;
  status: string;
  note: string;
  createdAt: string;
};

export type LocalMessage = {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
};

export type LocalInquiry = {
  id: string;
  subject: string;
  status: InquiryStatus;
  createdAt: string;
  updatedAt: string;
  messages: LocalMessage[];
};

export type PortalData = {
  applications: LocalApplication[];
  inquiries: LocalInquiry[];
};

type StoredUser = LocalUser & {
  salt: string;
  passwordHash: string;
};

const USERS_KEY = "passtrack.local.users";
const SESSION_KEY = "passtrack.local.session";
const PORTAL_KEY = "passtrack.local.portal.";
const HASH_ITERATIONS = 180_000;
const encoder = new TextEncoder();

function requireStorage() {
  if (typeof window === "undefined" || !window.localStorage) {
    throw new Error("Browser storage is unavailable. Enable local storage and try again.");
  }
  return window.localStorage;
}

function toBase64(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

async function hashPassword(password: string, salt: Uint8Array) {
  if (!window.crypto?.subtle) {
    throw new Error("Secure password hashing is unavailable in this browser. Open the app on localhost or use a modern browser.");
  }
  const saltBuffer = new Uint8Array(new ArrayBuffer(salt.byteLength));
  saltBuffer.set(salt);
  const key = await window.crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await window.crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: saltBuffer.buffer, iterations: HASH_ITERATIONS },
    key,
    256,
  );
  return toBase64(new Uint8Array(bits));
}

function readUsers(): StoredUser[] {
  const serialized = requireStorage().getItem(USERS_KEY);
  if (!serialized) return [];
  const parsed: unknown = JSON.parse(serialized);
  if (!Array.isArray(parsed) || !parsed.every(isStoredUser)) {
    throw new Error("Saved account data is invalid. Clear this app's local storage and register again.");
  }
  return parsed;
}

function isStoredUser(value: unknown): value is StoredUser {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return typeof record.id === "string"
    && typeof record.email === "string"
    && typeof record.fullName === "string"
    && record.role === "member"
    && typeof record.salt === "string"
    && typeof record.passwordHash === "string";
}

export async function registerLocalUser(fullName: string, email: string, password: string): Promise<LocalUser> {
  const normalizedEmail = email.trim().toLowerCase();
  const users = readUsers();
  if (users.some((user) => user.email === normalizedEmail)) {
    throw new Error("An account with this email already exists. Sign in instead.");
  }
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const passwordHash = await hashPassword(password, salt);
  const user: StoredUser = {
    id: window.crypto.randomUUID(),
    fullName: fullName.trim(),
    email: normalizedEmail,
    role: "member",
    salt: toBase64(salt),
    passwordHash,
  };
  users.push(user);
  requireStorage().setItem(USERS_KEY, JSON.stringify(users));
  savePortalData(user.id, { applications: [], inquiries: [] });
  requireStorage().setItem(SESSION_KEY, JSON.stringify({ userId: user.id }));
  return publicUser(user);
}

export async function signInLocalUser(email: string, password: string): Promise<LocalUser> {
  const normalizedEmail = email.trim().toLowerCase();
  const user = readUsers().find((entry) => entry.email === normalizedEmail);
  if (!user) throw new Error("Email or password is incorrect.");
  const salt = Uint8Array.from(atob(user.salt), (character) => character.charCodeAt(0));
  if (await hashPassword(password, salt) !== user.passwordHash) {
    throw new Error("Email or password is incorrect.");
  }
  requireStorage().setItem(SESSION_KEY, JSON.stringify({ userId: user.id }));
  return publicUser(user);
}

function publicUser(user: StoredUser): LocalUser {
  return { id: user.id, email: user.email, fullName: user.fullName, role: "member" };
}

export function getLocalSessionUser(): LocalUser | null {
  const storage = requireStorage();
  const sessionValue = storage.getItem(SESSION_KEY);
  if (!sessionValue) return null;
  const session: unknown = JSON.parse(sessionValue);
  if (!session || typeof session !== "object" || !("userId" in session) || typeof session.userId !== "string") {
    storage.removeItem(SESSION_KEY);
    throw new Error("Your local session is invalid. Please sign in again.");
  }
  const user = readUsers().find((entry) => entry.id === session.userId);
  if (!user) {
    storage.removeItem(SESSION_KEY);
    return null;
  }
  return publicUser(user);
}

export function signOutLocalUser() {
  requireStorage().removeItem(SESSION_KEY);
}

export function getPortalData(userId: string): PortalData {
  const value = requireStorage().getItem(`${PORTAL_KEY}${userId}`);
  if (!value) return { applications: [], inquiries: [] };
  const parsed: unknown = JSON.parse(value);
  if (!parsed || typeof parsed !== "object" || !("applications" in parsed) || !("inquiries" in parsed)) {
    throw new Error("Saved portal data is invalid. Clear this app's local storage and start again.");
  }
  return parsed as PortalData;
}

export function savePortalData(userId: string, data: PortalData) {
  requireStorage().setItem(`${PORTAL_KEY}${userId}`, JSON.stringify(data));
}

export function newLocalId() {
  return window.crypto.randomUUID();
}

export function formatApplicationNumber() {
  return `PAS-${window.crypto.randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase()}`;
}
