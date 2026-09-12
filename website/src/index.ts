import { timingSafeEqual } from "node:crypto";

type JsonRecord = Record<string, unknown>;

type ApplicationRow = {
  id: string;
  driver_type: "owner_operator" | "company_driver";
  full_name: string;
  phone: string;
  email: string;
  gender: string;
  experience: string;
  truck_year: string;
  truck_mileage: string;
  has_plate: string;
  amazon_relay_experience: string;
  start_availability: string;
  current_step: number;
  status: "draft" | "submitted";
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  cdl_document_uploaded_at?: string | null;
  cdl_processing_consent_at?: string | null;
  account_id?: string | null;
  review_status?: "new" | "reviewing" | "approved" | "declined";
};

type AccountRow = {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: "driver" | "broker" | "shipper";
  driver_type: "owner_operator" | "company_driver" | null;
  password_salt: string | null;
  password_hash: string | null;
  password_iterations: number | null;
  status: "pending" | "active";
  created_at: string;
  updated_at: string;
};

type QuoteRow = {
  id: string;
  account_id: string | null;
  requester_type: "broker" | "shipper";
  full_name: string;
  company_name: string;
  email: string;
  phone: string;
  mc_number: string;
  reference_number: string;
  pickup_city: string;
  pickup_state: string;
  pickup_zip: string;
  pickup_date: string;
  pickup_window: string;
  pickup_appointment: string;
  pickup_facility: string;
  delivery_city: string;
  delivery_state: string;
  delivery_zip: string;
  delivery_date: string;
  delivery_window: string;
  delivery_appointment: string;
  delivery_facility: string;
  equipment: string;
  commodity: string;
  total_weight: string;
  piece_count: string;
  dimensions: string;
  stackable: string;
  hazmat: string;
  temperature_control: string;
  temperature_range: string;
  load_type: string;
  special_services: string;
  notes: string;
  current_step: number;
  status: "draft" | "new" | "reviewing" | "quoted" | "booked" | "declined";
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
};

type VerificationPurpose = "activate" | "reset";

type VerificationRow = {
  id: string;
  account_id: string;
  purpose: VerificationPurpose;
  code_hash: string;
  expires_at: string;
  attempts: number;
  consumed_at: string | null;
  created_at: string;
};

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
};

const UPDATE_FIELDS = {
  full_name: { column: "full_name", max: 120 },
  phone: { column: "phone", max: 30 },
  email: { column: "email", max: 180 },
  gender: { column: "gender", max: 40 },
  experience: { column: "experience", max: 40 },
  truck_year: { column: "truck_year", max: 4 },
  truck_mileage: { column: "truck_mileage", max: 12 },
  has_plate: { column: "has_plate", max: 8 },
  amazon_relay_experience: { column: "amazon_relay_experience", max: 8 },
  start_availability: { column: "start_availability", max: 40 },
} as const;

const EXPERIENCE_VALUES = new Set(["under_1", "1_plus", "2_plus", "3_plus", "4_plus"]);
const GENDER_VALUES = new Set(["female", "male", "non_binary", "prefer_not_to_say"]);
const YES_NO_VALUES = new Set(["yes", "no"]);
const START_VALUES = new Set(["tomorrow", "this_week", "more_than_week"]);
const CDL_CONTENT_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);
const MAX_CDL_SIZE_BYTES = 5 * 1024 * 1024;

function cdlExtension(contentType: string | undefined): string {
  if (contentType === "image/png") return "png";
  if (contentType === "image/jpeg") return "jpg";
  return "pdf";
}
// Cloudflare Workers Web Crypto caps PBKDF2 at 100,000 iterations per operation.
const PASSWORD_ITERATIONS = 100_000;
const ACCOUNT_ROLES = new Set(["driver", "broker", "shipper"]);
const DRIVER_TYPES = new Set(["owner_operator", "company_driver"]);
const VERIFICATION_CODE_TTL_MS = 10 * 60 * 1000;
const VERIFICATION_RESEND_DELAY_MS = 60 * 1000;
const MAX_VERIFICATION_ATTEMPTS = 5;
const QUOTE_FIELDS = {
  full_name: 120, company_name: 160, email: 180, phone: 30, mc_number: 30, reference_number: 80,
  pickup_city: 100, pickup_state: 40, pickup_zip: 12, pickup_date: 20, pickup_window: 80,
  pickup_appointment: 8, pickup_facility: 50, delivery_city: 100, delivery_state: 40,
  delivery_zip: 12, delivery_date: 20, delivery_window: 80, delivery_appointment: 8,
  delivery_facility: 50, equipment: 50, commodity: 180, total_weight: 20, piece_count: 20,
  dimensions: 120, stackable: 8, hazmat: 8, temperature_control: 8, temperature_range: 80,
  load_type: 30, special_services: 500, notes: 2000,
} as const;

function json(data: unknown, status = 200, extraHeaders?: HeadersInit): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...JSON_HEADERS, ...extraHeaders },
  });
}

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function maskedEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  return `${local.slice(0, 2)}${"•".repeat(Math.max(2, Math.min(6, local.length - 2)))}@${domain}`;
}

async function sendEmail(env: Env, details: { to: string; subject: string; html: string; text: string }): Promise<void> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ from: env.EMAIL_FROM, ...details }),
  });
  if (!response.ok) {
    const message = await response.text();
    console.error(JSON.stringify({ message: "email delivery failed", status: response.status, detail: message.slice(0, 500) }));
    throw new Error("Email delivery failed");
  }
}

function emailShell(title: string, message: string, code?: string): string {
  const codeBlock = code
    ? `<div style="margin:28px 0;padding:18px 22px;background:#f3f6f9;border-left:4px solid #d31932;font:700 32px/1.2 Arial,sans-serif;letter-spacing:8px;color:#062b5a">${escapeHtml(code)}</div>`
    : "";
  return `<!doctype html><html><body style="margin:0;background:#f3f6f9;padding:32px 16px;color:#13263c;font-family:Arial,sans-serif"><table role="presentation" style="width:100%;max-width:620px;margin:auto;background:#fff;border-collapse:collapse"><tr><td style="height:6px;background:#d31932"></td></tr><tr><td style="padding:38px"><p style="margin:0 0 10px;color:#d31932;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase">Worldwide Cargo Express</p><h1 style="margin:0 0 18px;color:#062b5a;font-size:28px">${escapeHtml(title)}</h1><p style="margin:0;color:#4c5e72;font-size:16px;line-height:1.65">${escapeHtml(message)}</p>${codeBlock}<p style="margin:24px 0 0;color:#66768a;font-size:13px;line-height:1.6">If you did not request this, you can safely ignore this email. This mailbox is not monitored.</p></td></tr></table></body></html>`;
}

function newVerificationCode(): string {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return String(10_000 + (bytes[0] % 90_000));
}

async function verificationCodeHash(accountId: string, purpose: VerificationPurpose, code: string, env: Env): Promise<string> {
  return hmac(`wcx-verification:${accountId}:${purpose}:${code}`, env.AUTH_SECRET);
}

async function issueVerificationCode(env: Env, account: AccountRow, purpose: VerificationPurpose, enforceDelay = false): Promise<void> {
  const latest = await env.DB.prepare(
    "SELECT * FROM email_verifications WHERE account_id = ?1 AND purpose = ?2 ORDER BY created_at DESC LIMIT 1",
  ).bind(account.id, purpose).first<VerificationRow>();
  if (enforceDelay && latest && Date.now() - Date.parse(`${latest.created_at}${latest.created_at.endsWith("Z") ? "" : "Z"}`) < VERIFICATION_RESEND_DELAY_MS) {
    throw new Error("Please wait a minute before requesting another code.");
  }
  const code = newVerificationCode();
  const now = new Date();
  await env.DB.prepare(
    "INSERT INTO email_verifications (id, account_id, purpose, code_hash, expires_at, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
  ).bind(crypto.randomUUID(), account.id, purpose, await verificationCodeHash(account.id, purpose, code, env), new Date(now.getTime() + VERIFICATION_CODE_TTL_MS).toISOString(), now.toISOString()).run();
  const activation = purpose === "activate";
  const title = activation ? "Verify your email" : "Reset your password";
  const message = activation
    ? `Hi ${account.full_name.split(/\s+/u)[0] || "there"}, enter this five-digit code to finish creating your Worldwide Cargo Express account. It expires in 10 minutes.`
    : "Enter this five-digit code to choose a new password. It expires in 10 minutes.";
  await sendEmail(env, {
    to: account.email,
    subject: activation ? `${code} is your Worldwide Cargo Express verification code` : `${code} is your password reset code`,
    html: emailShell(title, message, code),
    text: `${title}\n\n${message}\n\nCode: ${code}\n\nIf you did not request this, you can ignore this email.`,
  });
}

async function consumeVerificationCode(env: Env, account: AccountRow, purpose: VerificationPurpose, code: string): Promise<boolean> {
  const verification = await env.DB.prepare(
    "SELECT * FROM email_verifications WHERE account_id = ?1 AND purpose = ?2 AND consumed_at IS NULL ORDER BY created_at DESC LIMIT 1",
  ).bind(account.id, purpose).first<VerificationRow>();
  if (!verification || Date.parse(verification.expires_at) <= Date.now() || verification.attempts >= MAX_VERIFICATION_ATTEMPTS) return false;
  const matches = await secureEqual(verification.code_hash, await verificationCodeHash(account.id, purpose, code, env));
  if (!matches) {
    await env.DB.prepare("UPDATE email_verifications SET attempts = attempts + 1 WHERE id = ?1").bind(verification.id).run();
    return false;
  }
  await env.DB.prepare("UPDATE email_verifications SET consumed_at = ?1 WHERE id = ?2").bind(new Date().toISOString(), verification.id).run();
  return true;
}

async function verifyTurnstile(request: Request, token: unknown, env: Env): Promise<boolean> {
  if (typeof token !== "string" || token.length < 1 || token.length > 4096) return false;
  const form = new FormData();
  form.set("secret", env.TURNSTILE_SECRET_KEY);
  form.set("response", token);
  const ip = request.headers.get("cf-connecting-ip");
  if (ip) form.set("remoteip", ip);
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
    const result = await response.json<{ success?: boolean; hostname?: string }>();
    return response.ok && result.success === true;
  } catch {
    return false;
  }
}

function errorResponse(message: string, status: number): Response {
  return json({ ok: false, error: message }, status);
}

async function readJson(request: Request): Promise<JsonRecord | null> {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 16_384) return null;
  try {
    const value: unknown = await request.json();
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    return value as JsonRecord;
  } catch {
    return null;
  }
}

function allowedOrigin(request: Request, env: Env): string | null {
  const origin = request.headers.get("origin");
  if (!origin) return new URL(request.url).origin;
  const allowed = (env.PUBLIC_ORIGINS ?? "https://edgeformmedia-pixel.github.io").split(",").map((value) => value.trim()).filter(Boolean);
  if (origin === new URL(request.url).origin || allowed.includes(origin)) return origin;
  return null;
}

function corsHeaders(origin: string): HeadersInit {
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-credentials": "true",
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "GET, POST, PATCH, DELETE, OPTIONS",
    vary: "Origin",
  };
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/u, "");
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return toBase64Url(new Uint8Array(digest));
}

async function hmac(value: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return toBase64Url(new Uint8Array(signature));
}

async function secureEqual(left: string, right: string): Promise<boolean> {
  const [leftHash, rightHash] = await Promise.all([sha256(left), sha256(right)]);
  return timingSafeEqual(
    new TextEncoder().encode(leftHash),
    new TextEncoder().encode(rightHash),
  );
}

function fromBase64Url(value: string): Uint8Array {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const binary = atob(value.replaceAll("-", "+").replaceAll("_", "/") + padding);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function passwordHash(password: string, salt: string, iterations: number, pepper: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(`${password}\u0000${pepper}`),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: fromBase64Url(salt), iterations },
    keyMaterial,
    256,
  );
  return toBase64Url(new Uint8Array(bits));
}

async function newPasswordRecord(password: string, pepper: string): Promise<{ salt: string; hash: string; iterations: number }> {
  const saltBytes = new Uint8Array(16);
  crypto.getRandomValues(saltBytes);
  const salt = toBase64Url(saltBytes);
  return { salt, hash: await passwordHash(password, salt, PASSWORD_ITERATIONS, pepper), iterations: PASSWORD_ITERATIONS };
}

function validPassword(password: string): boolean {
  return password.length >= 10 && password.length <= 128;
}

async function accountSessionCookie(accountId: string, env: Env): Promise<string> {
  const expires = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const signature = await hmac(`wcx-account:${accountId}:${expires}`, env.AUTH_SECRET);
  return `wcx_account=${accountId}.${expires}.${signature}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=604800`;
}

async function currentAccount(request: Request, env: Env): Promise<AccountRow | null> {
  const session = cookieValue(request, "wcx_account");
  if (!session) return null;
  const [accountId, expiresText, signature] = session.split(".");
  const expires = Number(expiresText);
  if (!accountId || !signature || !Number.isSafeInteger(expires) || expires <= Date.now()) return null;
  const expected = await hmac(`wcx-account:${accountId}:${expiresText}`, env.AUTH_SECRET);
  if (!(await secureEqual(signature, expected))) return null;
  return env.DB.prepare(
    "SELECT * FROM accounts WHERE id = ?1 AND status = 'active' LIMIT 1",
  ).bind(accountId).first<AccountRow>();
}

async function ensurePendingAccount(
  env: Env,
  details: { email: string; fullName: string; phone: string; role: "driver" | "broker" | "shipper"; driverType?: "owner_operator" | "company_driver" | null },
): Promise<AccountRow> {
  const email = details.email.trim().toLowerCase();
  const existing = await env.DB.prepare("SELECT * FROM accounts WHERE email = ?1 LIMIT 1").bind(email).first<AccountRow>();
  if (existing) return existing;
  const id = crypto.randomUUID();
  await env.DB.prepare(
    "INSERT OR IGNORE INTO accounts (id, email, full_name, phone, role, driver_type) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
  ).bind(id, email, details.fullName.trim(), details.phone.trim(), details.role, details.driverType ?? null).run();
  const created = await env.DB.prepare("SELECT * FROM accounts WHERE email = ?1 LIMIT 1").bind(email).first<AccountRow>();
  if (!created) throw new Error("Unable to create account");
  return created;
}

function cookieValue(request: Request, name: string): string | null {
  const cookie = request.headers.get("cookie") ?? "";
  for (const part of cookie.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return value.join("=");
  }
  return null;
}

async function hasAdminSession(request: Request, env: Env): Promise<boolean> {
  const session = cookieValue(request, "wcx_admin");
  if (!session) return false;
  const [expiresText, signature] = session.split(".");
  const expires = Number(expiresText);
  if (!expiresText || !signature || !Number.isSafeInteger(expires) || expires <= Date.now()) return false;
  const expected = await hmac(`wcx-admin:${expiresText}`, env.ADMIN_PASSWORD);
  return secureEqual(signature, expected);
}

function validateField(field: keyof typeof UPDATE_FIELDS, value: string): boolean {
  if (value.length > UPDATE_FIELDS[field].max) return false;
  if (field === "gender") return value === "" || GENDER_VALUES.has(value);
  if (field === "experience") return value === "" || EXPERIENCE_VALUES.has(value);
  if (field === "has_plate" || field === "amazon_relay_experience") return value === "" || YES_NO_VALUES.has(value);
  if (field === "start_availability") return value === "" || START_VALUES.has(value);
  if (field === "truck_year") return /^\d{0,4}$/u.test(value);
  if (field === "truck_mileage") return /^\d{0,12}$/u.test(value);
  return true;
}

function missingRequired(row: ApplicationRow): string[] {
  const common: Array<keyof ApplicationRow> = ["full_name", "phone", "email", "gender", "experience"];
  const roleSpecific: Array<keyof ApplicationRow> = row.driver_type === "owner_operator"
    ? ["truck_year", "truck_mileage", "has_plate"]
    : ["amazon_relay_experience", "start_availability"];
  return [...common, ...roleSpecific].filter((field) => String(row[field] ?? "").trim() === "");
}

async function createApplication(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request);
  const driverType = body?.driverType;
  if (driverType !== "owner_operator" && driverType !== "company_driver") {
    return errorResponse("Choose owner-operator or company driver.", 400);
  }

  const id = crypto.randomUUID();
  const tokenBytes = new Uint8Array(32);
  crypto.getRandomValues(tokenBytes);
  const editToken = toBase64Url(tokenBytes);
  const tokenHash = await sha256(editToken);

  await env.DB.prepare(
    "INSERT INTO applications (id, edit_token_hash, driver_type) VALUES (?1, ?2, ?3)",
  ).bind(id, tokenHash, driverType).run();

  return json({ ok: true, id, editToken }, 201);
}

async function updateApplication(request: Request, env: Env, id: string): Promise<Response> {
  const body = await readJson(request);
  const editToken = body?.editToken;
  const fieldValue = body?.field;
  const value = body?.value;
  const currentStep = body?.currentStep;

  if (typeof editToken !== "string" || typeof fieldValue !== "string" || typeof value !== "string") {
    return errorResponse("Invalid draft update.", 400);
  }
  if (!Object.hasOwn(UPDATE_FIELDS, fieldValue)) return errorResponse("Unknown field.", 400);
  const field = fieldValue as keyof typeof UPDATE_FIELDS;
  if (!validateField(field, value)) return errorResponse("Invalid field value.", 400);
  const step = typeof currentStep === "number" && Number.isInteger(currentStep)
    ? Math.max(0, Math.min(20, currentStep))
    : 0;
  const tokenHash = await sha256(editToken);
  const now = new Date().toISOString();
  const column = UPDATE_FIELDS[field].column;
  const result = await env.DB.prepare(
    `UPDATE applications SET ${column} = ?1, current_step = ?2, updated_at = ?3 WHERE id = ?4 AND edit_token_hash = ?5 AND status = 'draft'`,
  ).bind(value, step, now, id, tokenHash).run();

  if (result.meta.changes !== 1) return errorResponse("Draft not found or already submitted.", 404);
  return json({ ok: true, savedAt: now });
}

async function uploadCdl(request: Request, env: Env, id: string): Promise<Response> {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_CDL_SIZE_BYTES + 128_000) return errorResponse("The CDL file must be 5 MB or smaller.", 413);
  let form: FormData;
  try { form = await request.formData(); } catch { return errorResponse("Choose a valid CDL file to upload.", 400); }
  const editToken = form.get("editToken");
  const consent = form.get("consent");
  const file = form.get("file");
  if (typeof editToken !== "string" || consent !== "yes" || !(file instanceof File)) {
    return errorResponse("Please confirm consent and choose a CDL file.", 400);
  }
  if (!CDL_CONTENT_TYPES.has(file.type) || file.size === 0 || file.size > MAX_CDL_SIZE_BYTES) {
    return errorResponse("Upload a JPG, PNG, or PDF CDL file up to 5 MB.", 400);
  }
  const tokenHash = await sha256(editToken);
  const application = await env.DB.prepare(
    "SELECT id FROM applications WHERE id = ?1 AND edit_token_hash = ?2 AND status = 'draft' LIMIT 1",
  ).bind(id, tokenHash).first<{ id: string }>();
  if (!application) return errorResponse("Application draft not found.", 404);
  const objectKey = `applications/${id}/cdl`;
  try {
    await env.DRIVER_DOCUMENTS.put(objectKey, file, {
      httpMetadata: { contentType: file.type, contentDisposition: `attachment; filename=\"cdl-license.${cdlExtension(file.type)}\"` },
    });
    const now = new Date().toISOString();
    await env.DB.prepare(
      "UPDATE applications SET cdl_document_uploaded_at = ?1, cdl_processing_consent_at = ?1, updated_at = ?1 WHERE id = ?2 AND edit_token_hash = ?3",
    ).bind(now, id, tokenHash).run();
    return json({ ok: true, uploadedAt: now });
  } catch {
    return errorResponse("We couldn’t upload that file. Please try again.", 500);
  }
}

async function downloadCdl(request: Request, env: Env, id: string): Promise<Response> {
  if (!(await hasAdminSession(request, env))) return errorResponse("Unauthorized.", 401);
  const application = await env.DB.prepare(
    "SELECT cdl_document_uploaded_at FROM applications WHERE id = ?1 LIMIT 1",
  ).bind(id).first<ApplicationRow>();
  if (!application?.cdl_document_uploaded_at) return errorResponse("CDL document not found.", 404);
  const object = await env.DRIVER_DOCUMENTS.get(`applications/${id}/cdl`);
  if (!object) return errorResponse("CDL document not found.", 404);
  const headers = new Headers({ "cache-control": "private, no-store" });
  object.writeHttpMetadata(headers);
  headers.set("content-disposition", `attachment; filename=\"cdl-license.${cdlExtension(object.httpMetadata?.contentType)}\"`);
  return new Response(object.body, { headers });
}

async function submitApplication(request: Request, env: Env, id: string): Promise<Response> {
  const body = await readJson(request);
  const editToken = body?.editToken;
  if (typeof editToken !== "string") return errorResponse("Invalid submission.", 400);
  if (!(await verifyTurnstile(request, body?.captchaToken, env))) {
    return errorResponse("Please complete the CAPTCHA and try again.", 400);
  }
  const tokenHash = await sha256(editToken);
  const row = await env.DB.prepare(
    "SELECT * FROM applications WHERE id = ?1 AND edit_token_hash = ?2 LIMIT 1",
  ).bind(id, tokenHash).first<ApplicationRow>();
  if (!row) return errorResponse("Application not found.", 404);
  const missing = missingRequired(row);
  if (missing.length > 0) return json({ ok: false, error: "Please complete every question.", missing }, 400);

  const now = new Date().toISOString();
  const account = await ensurePendingAccount(env, {
    email: row.email,
    fullName: row.full_name,
    phone: row.phone,
    role: "driver",
    driverType: row.driver_type,
  });
  await env.DB.prepare(
    "UPDATE applications SET status = 'submitted', account_id = ?1, submitted_at = ?2, updated_at = ?2 WHERE id = ?3 AND edit_token_hash = ?4",
  ).bind(account.id, now, id, tokenHash).run();
  return json({ ok: true, submittedAt: now, accountStatus: account.status, email: account.email });
}

async function activateAccount(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request);
  const source = body?.source;
  const sourceId = body?.sourceId;
  const editToken = body?.editToken;
  const password = body?.password;
  const confirmPassword = body?.confirmPassword;
  if ((source !== "application" && source !== "quote") || typeof sourceId !== "string" || typeof editToken !== "string") {
    return errorResponse("Invalid account setup request.", 400);
  }
  if (typeof password !== "string" || typeof confirmPassword !== "string" || password !== confirmPassword) {
    return errorResponse("Passwords do not match.", 400);
  }
  if (!validPassword(password)) return errorResponse("Use a password between 10 and 128 characters.", 400);
  const tokenHash = await sha256(editToken);
  const table = source === "application" ? "applications" : "quotes";
  const sourceRow = await env.DB.prepare(
    `SELECT account_id FROM ${table} WHERE id = ?1 AND edit_token_hash = ?2 AND status != 'draft' LIMIT 1`,
  ).bind(sourceId, tokenHash).first<{ account_id: string | null }>();
  if (!sourceRow?.account_id) return errorResponse("Account setup link is invalid.", 404);
  const account = await env.DB.prepare("SELECT * FROM accounts WHERE id = ?1 LIMIT 1").bind(sourceRow.account_id).first<AccountRow>();
  if (!account) return errorResponse("Account not found.", 404);
  if (account.status === "active") return errorResponse("An account already exists for this email. Please sign in.", 409);

  const record = await newPasswordRecord(password, env.AUTH_SECRET);
  const now = new Date().toISOString();
  await env.DB.prepare(
    "UPDATE accounts SET password_salt = ?1, password_hash = ?2, password_iterations = ?3, updated_at = ?4 WHERE id = ?5 AND status = 'pending'",
  ).bind(record.salt, record.hash, record.iterations, now, account.id).run();
  try {
    await issueVerificationCode(env, account, "activate");
  } catch {
    return errorResponse("We couldn’t send your verification code. Please try again.", 503);
  }
  return json({ ok: true, requiresVerification: true, email: account.email, maskedEmail: maskedEmail(account.email) });
}

async function registerAccount(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request);
  const fullName = body?.fullName;
  const emailValue = body?.email;
  const phone = body?.phone;
  const role = body?.role;
  const driverType = body?.driverType;
  const password = body?.password;
  const confirmPassword = body?.confirmPassword;
  if (typeof fullName !== "string" || !fullName.trim() || fullName.length > 120 || typeof emailValue !== "string" || typeof phone !== "string") {
    return errorResponse("Enter your name, email, and phone number.", 400);
  }
  const email = emailValue.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email) || email.length > 180 || phone.length > 30) return errorResponse("Enter valid contact information.", 400);
  if (typeof role !== "string" || !ACCOUNT_ROLES.has(role)) return errorResponse("Choose an account type.", 400);
  if (role === "driver" && (typeof driverType !== "string" || !DRIVER_TYPES.has(driverType))) return errorResponse("Choose owner-operator or company driver.", 400);
  if (typeof password !== "string" || typeof confirmPassword !== "string" || password !== confirmPassword) return errorResponse("Passwords do not match.", 400);
  if (!validPassword(password)) return errorResponse("Use a password between 10 and 128 characters.", 400);
  const existing = await env.DB.prepare("SELECT id FROM accounts WHERE email = ?1 LIMIT 1").bind(email).first<{ id: string }>();
  if (existing) return errorResponse("An account already exists for this email.", 409);
  const accountId = crypto.randomUUID();
  const record = await newPasswordRecord(password, env.AUTH_SECRET);
  const now = new Date().toISOString();
  await env.DB.prepare(
    "INSERT INTO accounts (id, email, full_name, phone, role, driver_type, password_salt, password_hash, password_iterations, status, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, 'pending', ?10)",
  ).bind(accountId, email, fullName.trim(), phone.trim(), role, role === "driver" ? driverType : null, record.salt, record.hash, record.iterations, now).run();
  const account = await env.DB.prepare("SELECT * FROM accounts WHERE id = ?1 LIMIT 1").bind(accountId).first<AccountRow>();
  if (!account) return errorResponse("Unable to create account.", 500);
  try {
    await issueVerificationCode(env, account, "activate");
  } catch {
    await env.DB.prepare("DELETE FROM accounts WHERE id = ?1 AND status = 'pending'").bind(accountId).run();
    return errorResponse("We couldn’t send your verification code. Please try again.", 503);
  }
  return json({ ok: true, requiresVerification: true, email, maskedEmail: maskedEmail(email) }, 201);
}

async function verifyAccountEmail(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  if (!/^\d{5}$/u.test(code)) return errorResponse("Enter the five-digit code from your email.", 400);
  const account = await env.DB.prepare("SELECT * FROM accounts WHERE email = ?1 AND status = 'pending' LIMIT 1").bind(email).first<AccountRow>();
  if (!account || !(await consumeVerificationCode(env, account, "activate", code))) {
    return errorResponse("That code is incorrect or has expired.", 400);
  }
  const now = new Date().toISOString();
  await env.DB.prepare("UPDATE accounts SET status = 'active', updated_at = ?1 WHERE id = ?2 AND status = 'pending'").bind(now, account.id).run();
  try {
    await sendEmail(env, {
      to: account.email,
      subject: "Welcome to Worldwide Cargo Express",
      html: emailShell("Your account is ready", `Hi ${account.full_name.split(/\s+/u)[0] || "there"}, your Worldwide Cargo Express account is verified and ready to use.`),
      text: `Your account is ready\n\nHi ${account.full_name.split(/\s+/u)[0] || "there"}, your Worldwide Cargo Express account is verified and ready to use.`,
    });
  } catch {
    // Verification succeeds even if the non-essential welcome email is delayed.
  }
  return json({ ok: true, role: account.role }, 200, { "set-cookie": await accountSessionCookie(account.id, env) });
}

async function resendAccountCode(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const account = await env.DB.prepare("SELECT * FROM accounts WHERE email = ?1 AND status = 'pending' LIMIT 1").bind(email).first<AccountRow>();
  if (!account) return errorResponse("Account verification is no longer pending.", 400);
  try {
    await issueVerificationCode(env, account, "activate", true);
    return json({ ok: true, maskedEmail: maskedEmail(account.email) });
  } catch (caught) {
    const message = caught instanceof Error && caught.message.startsWith("Please wait") ? caught.message : "We couldn’t send another code. Please try again.";
    return errorResponse(message, caught instanceof Error && caught.message.startsWith("Please wait") ? 429 : 503);
  }
}

async function requestPasswordReset(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const account = await env.DB.prepare("SELECT * FROM accounts WHERE email = ?1 AND status = 'active' LIMIT 1").bind(email).first<AccountRow>();
  if (account) {
    try { await issueVerificationCode(env, account, "reset", true); } catch {
      console.error(JSON.stringify({ message: "password reset email was not sent", accountId: account.id }));
    }
  }
  return json({ ok: true, message: "If that email has an account, a five-digit reset code is on the way." });
}

async function resetPassword(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  const password = body?.password;
  const confirmPassword = body?.confirmPassword;
  if (!/^\d{5}$/u.test(code)) return errorResponse("Enter the five-digit code from your email.", 400);
  if (typeof password !== "string" || typeof confirmPassword !== "string" || password !== confirmPassword) return errorResponse("Passwords do not match.", 400);
  if (!validPassword(password)) return errorResponse("Use a password between 10 and 128 characters.", 400);
  const account = await env.DB.prepare("SELECT * FROM accounts WHERE email = ?1 AND status = 'active' LIMIT 1").bind(email).first<AccountRow>();
  if (!account || !(await consumeVerificationCode(env, account, "reset", code))) return errorResponse("That code is incorrect or has expired.", 400);
  const record = await newPasswordRecord(password, env.AUTH_SECRET);
  await env.DB.prepare(
    "UPDATE accounts SET password_salt = ?1, password_hash = ?2, password_iterations = ?3, updated_at = ?4 WHERE id = ?5",
  ).bind(record.salt, record.hash, record.iterations, new Date().toISOString(), account.id).run();
  try {
    await sendEmail(env, {
      to: account.email,
      subject: "Your Worldwide Cargo Express password was changed",
      html: emailShell("Password changed", "Your account password was changed successfully. If you did not make this change, contact Worldwide Cargo Express immediately."),
      text: "Password changed\n\nYour account password was changed successfully. If you did not make this change, contact Worldwide Cargo Express immediately.",
    });
  } catch {
    // Password reset is complete even if the confirmation email is delayed.
  }
  return json({ ok: true });
}

async function accountLogin(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = body?.password;
  const account = await env.DB.prepare("SELECT * FROM accounts WHERE email = ?1 AND status = 'active' LIMIT 1").bind(email).first<AccountRow>();
  if (!account?.password_salt || !account.password_hash || !account.password_iterations || typeof password !== "string") {
    return errorResponse("Incorrect email or password.", 401);
  }
  const hash = await passwordHash(password, account.password_salt, account.password_iterations, env.AUTH_SECRET);
  if (!(await secureEqual(hash, account.password_hash))) return errorResponse("Incorrect email or password.", 401);
  return json({ ok: true, role: account.role }, 200, { "set-cookie": await accountSessionCookie(account.id, env) });
}

async function accountDashboard(request: Request, env: Env): Promise<Response> {
  const account = await currentAccount(request, env);
  if (!account) return errorResponse("Unauthorized.", 401);
  const [applications, quotes, offers] = await env.DB.batch([
    env.DB.prepare("SELECT id, driver_type, status, review_status, created_at, updated_at, submitted_at FROM applications WHERE account_id = ?1 ORDER BY updated_at DESC LIMIT 50").bind(account.id),
    env.DB.prepare("SELECT id, requester_type, pickup_city, pickup_state, delivery_city, delivery_state, equipment, commodity, status, created_at, updated_at, submitted_at FROM quotes WHERE account_id = ?1 ORDER BY updated_at DESC LIMIT 100").bind(account.id),
    env.DB.prepare("SELECT o.id, o.quote_id, o.offered_rate_cents, o.notes, o.status, o.created_at, q.pickup_city, q.pickup_state, q.delivery_city, q.delivery_state, q.equipment, q.commodity FROM driver_offers o JOIN quotes q ON q.id = o.quote_id WHERE o.driver_account_id = ?1 ORDER BY o.updated_at DESC LIMIT 100").bind(account.id),
  ]);
  return json({
    ok: true,
    account: { id: account.id, email: account.email, fullName: account.full_name, phone: account.phone, role: account.role, driverType: account.driver_type },
    applications: applications.results,
    quotes: quotes.results,
    offers: offers.results,
  });
}

function quoteFieldValid(field: keyof typeof QUOTE_FIELDS, value: string): boolean {
  if (value.length > QUOTE_FIELDS[field]) return false;
  if (["pickup_appointment", "delivery_appointment", "stackable", "hazmat", "temperature_control"].includes(field)) return value === "" || YES_NO_VALUES.has(value);
  if (field === "total_weight" || field === "piece_count") return /^\d{0,20}$/u.test(value);
  return true;
}

async function createQuote(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request);
  const requesterType = body?.requesterType;
  if (requesterType !== "broker" && requesterType !== "shipper") return errorResponse("Choose broker or direct shipper.", 400);
  const id = crypto.randomUUID();
  const tokenBytes = new Uint8Array(32);
  crypto.getRandomValues(tokenBytes);
  const editToken = toBase64Url(tokenBytes);
  await env.DB.prepare("INSERT INTO quotes (id, edit_token_hash, requester_type) VALUES (?1, ?2, ?3)")
    .bind(id, await sha256(editToken), requesterType).run();
  return json({ ok: true, id, editToken }, 201);
}

async function updateQuote(request: Request, env: Env, id: string): Promise<Response> {
  const body = await readJson(request);
  const editToken = body?.editToken;
  const fieldValue = body?.field;
  const value = body?.value;
  if (typeof editToken !== "string" || typeof fieldValue !== "string" || typeof value !== "string" || !Object.hasOwn(QUOTE_FIELDS, fieldValue)) {
    return errorResponse("Invalid quote update.", 400);
  }
  const field = fieldValue as keyof typeof QUOTE_FIELDS;
  if (!quoteFieldValid(field, value)) return errorResponse("Invalid field value.", 400);
  const step = typeof body?.currentStep === "number" && Number.isInteger(body.currentStep) ? Math.max(0, Math.min(20, body.currentStep)) : 0;
  const result = await env.DB.prepare(
    `UPDATE quotes SET ${field} = ?1, current_step = ?2, updated_at = ?3 WHERE id = ?4 AND edit_token_hash = ?5 AND status = 'draft'`,
  ).bind(value, step, new Date().toISOString(), id, await sha256(editToken)).run();
  if (result.meta.changes !== 1) return errorResponse("Quote draft not found.", 404);
  return json({ ok: true });
}

function quoteMissing(row: QuoteRow): string[] {
  const required: Array<keyof QuoteRow> = [
    "full_name", "company_name", "email", "phone", "pickup_city", "pickup_state", "pickup_zip", "pickup_date",
    "delivery_city", "delivery_state", "delivery_zip", "delivery_date", "equipment", "commodity", "total_weight", "piece_count",
  ];
  if (row.requester_type === "broker") required.push("mc_number");
  return required.filter((field) => String(row[field] ?? "").trim() === "");
}

async function submitQuote(request: Request, env: Env, id: string): Promise<Response> {
  const body = await readJson(request);
  const editToken = body?.editToken;
  if (typeof editToken !== "string") return errorResponse("Invalid quote submission.", 400);
  const tokenHash = await sha256(editToken);
  const row = await env.DB.prepare("SELECT * FROM quotes WHERE id = ?1 AND edit_token_hash = ?2 LIMIT 1").bind(id, tokenHash).first<QuoteRow>();
  if (!row) return errorResponse("Quote not found.", 404);
  const missing = quoteMissing(row);
  if (missing.length) return json({ ok: false, error: "Complete the required quote details.", missing }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(row.email)) return errorResponse("Enter a valid email address.", 400);
  const account = await ensurePendingAccount(env, { email: row.email, fullName: row.full_name, phone: row.phone, role: row.requester_type });
  const now = new Date().toISOString();
  await env.DB.prepare("UPDATE quotes SET account_id = ?1, status = 'new', submitted_at = ?2, updated_at = ?2 WHERE id = ?3 AND edit_token_hash = ?4")
    .bind(account.id, now, id, tokenHash).run();
  return json({ ok: true, accountStatus: account.status, email: account.email, submittedAt: now });
}

async function adminQuotes(request: Request, env: Env): Promise<Response> {
  if (!(await hasAdminSession(request, env))) return errorResponse("Unauthorized.", 401);
  const [quotes, drivers, offers] = await env.DB.batch([
    env.DB.prepare("SELECT id, requester_type, full_name, company_name, email, phone, mc_number, reference_number, pickup_city, pickup_state, pickup_zip, pickup_date, delivery_city, delivery_state, delivery_zip, delivery_date, equipment, commodity, total_weight, piece_count, status, updated_at FROM quotes WHERE status != 'draft' ORDER BY updated_at DESC LIMIT 500"),
    env.DB.prepare("SELECT a.id, a.full_name, a.email, a.phone, a.driver_type, a.status, ap.experience, ap.truck_year, ap.truck_mileage, ap.has_plate FROM accounts a LEFT JOIN applications ap ON ap.account_id = a.id WHERE a.role = 'driver' GROUP BY a.id ORDER BY a.updated_at DESC LIMIT 500"),
    env.DB.prepare("SELECT o.id, o.quote_id, o.driver_account_id, o.offered_rate_cents, o.notes, o.status, o.created_at, a.full_name AS driver_name FROM driver_offers o JOIN accounts a ON a.id = o.driver_account_id ORDER BY o.updated_at DESC LIMIT 500"),
  ]);
  return json({ ok: true, quotes: quotes.results, drivers: drivers.results, offers: offers.results });
}

async function createDriverOffer(request: Request, env: Env): Promise<Response> {
  if (!(await hasAdminSession(request, env))) return errorResponse("Unauthorized.", 401);
  const body = await readJson(request);
  const quoteId = body?.quoteId;
  const driverAccountId = body?.driverAccountId;
  const rateText = body?.offeredRate;
  const notes = body?.notes;
  if (typeof quoteId !== "string" || typeof driverAccountId !== "string" || typeof notes !== "string" || notes.length > 1000) return errorResponse("Invalid offer.", 400);
  const rate = typeof rateText === "string" && rateText.trim() ? Number(rateText) : null;
  if (rate !== null && (!Number.isFinite(rate) || rate < 0 || rate > 1_000_000)) return errorResponse("Enter a valid offer amount.", 400);
  const [quote, driver] = await Promise.all([
    env.DB.prepare("SELECT id FROM quotes WHERE id = ?1 AND status != 'draft' LIMIT 1").bind(quoteId).first<{ id: string }>(),
    env.DB.prepare("SELECT id FROM accounts WHERE id = ?1 AND role = 'driver' LIMIT 1").bind(driverAccountId).first<{ id: string }>(),
  ]);
  if (!quote || !driver) return errorResponse("Choose a valid quote and driver.", 400);
  const now = new Date().toISOString();
  await env.DB.batch([
    env.DB.prepare("INSERT INTO driver_offers (id, quote_id, driver_account_id, offered_rate_cents, notes, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6) ON CONFLICT (quote_id, driver_account_id) DO UPDATE SET offered_rate_cents = excluded.offered_rate_cents, notes = excluded.notes, status = 'offered', updated_at = excluded.updated_at")
      .bind(crypto.randomUUID(), quoteId, driverAccountId, rate === null ? null : Math.round(rate * 100), notes.trim(), now),
    env.DB.prepare("UPDATE quotes SET status = 'quoted', updated_at = ?1 WHERE id = ?2").bind(now, quoteId),
  ]);
  return json({ ok: true }, 201);
}

async function updateOfferResponse(request: Request, env: Env, offerId: string): Promise<Response> {
  const account = await currentAccount(request, env);
  if (!account || account.role !== "driver") return errorResponse("Unauthorized.", 401);
  const body = await readJson(request);
  const status = body?.status;
  if (status !== "accepted" && status !== "declined") return errorResponse("Choose accept or decline.", 400);
  const result = await env.DB.prepare(
    "UPDATE driver_offers SET status = ?1, updated_at = ?2 WHERE id = ?3 AND driver_account_id = ?4 AND status = 'offered'",
  ).bind(status, new Date().toISOString(), offerId, account.id).run();
  if (result.meta.changes !== 1) return errorResponse("Offer not found.", 404);
  return json({ ok: true });
}

async function updateQuoteStatus(request: Request, env: Env, quoteId: string): Promise<Response> {
  if (!(await hasAdminSession(request, env))) return errorResponse("Unauthorized.", 401);
  const body = await readJson(request);
  const status = body?.status;
  if (status !== "new" && status !== "reviewing" && status !== "quoted" && status !== "booked" && status !== "declined") {
    return errorResponse("Invalid quote status.", 400);
  }
  const result = await env.DB.prepare("UPDATE quotes SET status = ?1, updated_at = ?2 WHERE id = ?3 AND status != 'draft'")
    .bind(status, new Date().toISOString(), quoteId).run();
  if (result.meta.changes !== 1) return errorResponse("Quote not found.", 404);
  return json({ ok: true });
}

async function adminLogin(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request);
  const password = body?.password;
  if (typeof password !== "string" || !(await secureEqual(password, env.ADMIN_PASSWORD))) {
    return errorResponse("Incorrect password.", 401);
  }
  const expires = Date.now() + 8 * 60 * 60 * 1000;
  const signature = await hmac(`wcx-admin:${expires}`, env.ADMIN_PASSWORD);
  const cookie = `wcx_admin=${expires}.${signature}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=28800`;
  return json({ ok: true }, 200, { "set-cookie": cookie });
}

async function listApplications(request: Request, env: Env): Promise<Response> {
  if (!(await hasAdminSession(request, env))) return errorResponse("Unauthorized.", 401);
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const allowedStatus = status === "draft" || status === "submitted" ? status : null;
  const statement = allowedStatus
    ? env.DB.prepare(
      "SELECT id, account_id, driver_type, full_name, phone, email, gender, experience, truck_year, truck_mileage, has_plate, amazon_relay_experience, start_availability, cdl_document_uploaded_at, current_step, status, created_at, updated_at, submitted_at FROM applications WHERE status = ?1 ORDER BY updated_at DESC LIMIT 500",
    ).bind(allowedStatus)
    : env.DB.prepare(
      "SELECT id, account_id, driver_type, full_name, phone, email, gender, experience, truck_year, truck_mileage, has_plate, amazon_relay_experience, start_availability, cdl_document_uploaded_at, current_step, status, created_at, updated_at, submitted_at FROM applications ORDER BY updated_at DESC LIMIT 500",
    );
  const result = await statement.all<ApplicationRow>();
  return json({ ok: true, applications: result.results });
}

async function deleteAccount(request: Request, env: Env, accountId: string): Promise<Response> {
  if (!(await hasAdminSession(request, env))) return errorResponse("Unauthorized.", 401);
  const account = await env.DB.prepare("SELECT id FROM accounts WHERE id = ?1 LIMIT 1").bind(accountId).first<{ id: string }>();
  if (!account) return errorResponse("Account not found.", 404);
  const now = new Date().toISOString();
  await env.DB.batch([
    env.DB.prepare("DELETE FROM driver_offers WHERE driver_account_id = ?1").bind(accountId),
    env.DB.prepare("UPDATE applications SET account_id = NULL, updated_at = ?2 WHERE account_id = ?1").bind(accountId, now),
    env.DB.prepare("UPDATE quotes SET account_id = NULL, updated_at = ?2 WHERE account_id = ?1").bind(accountId, now),
    env.DB.prepare("DELETE FROM accounts WHERE id = ?1").bind(accountId),
  ]);
  return json({ ok: true });
}

async function deleteApplication(request: Request, env: Env, applicationId: string): Promise<Response> {
  if (!(await hasAdminSession(request, env))) return errorResponse("Unauthorized.", 401);
  const application = await env.DB.prepare("SELECT id, cdl_document_uploaded_at FROM applications WHERE id = ?1 LIMIT 1")
    .bind(applicationId).first<{ id: string; cdl_document_uploaded_at: string | null }>();
  if (!application) return errorResponse("Application not found.", 404);
  await env.DB.prepare("DELETE FROM applications WHERE id = ?1").bind(applicationId).run();
  if (application.cdl_document_uploaded_at) {
    try { await env.DRIVER_DOCUMENTS.delete(`applications/${applicationId}/cdl`); } catch {
      console.error(JSON.stringify({ message: "deleted application left an orphaned CDL object", applicationId }));
    }
  }
  return json({ ok: true });
}

async function handleApi(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  if (request.method === "GET" && path === "/api/config") {
    return json({ ok: true, turnstileSiteKey: env.TURNSTILE_SITE_KEY });
  }

  if (request.method === "POST" && path === "/api/applications") return createApplication(request, env);
  const cdlUploadMatch = path.match(/^\/api\/applications\/([0-9a-f-]{36})\/documents\/cdl$/u);
  if (cdlUploadMatch && request.method === "POST") return uploadCdl(request, env, cdlUploadMatch[1]);
  const applicationMatch = path.match(/^\/api\/applications\/([0-9a-f-]{36})(?:\/(submit))?$/u);
  if (applicationMatch && request.method === "PATCH" && !applicationMatch[2]) {
    return updateApplication(request, env, applicationMatch[1]);
  }
  if (applicationMatch && request.method === "POST" && applicationMatch[2] === "submit") {
    return submitApplication(request, env, applicationMatch[1]);
  }

  if (request.method === "POST" && path === "/api/quotes") return createQuote(request, env);
  const quoteMatch = path.match(/^\/api\/quotes\/([0-9a-f-]{36})(?:\/(submit))?$/u);
  if (quoteMatch && request.method === "PATCH" && !quoteMatch[2]) return updateQuote(request, env, quoteMatch[1]);
  if (quoteMatch && request.method === "POST" && quoteMatch[2] === "submit") return submitQuote(request, env, quoteMatch[1]);

  if (request.method === "POST" && path === "/api/account/activate") return activateAccount(request, env);
  if (request.method === "POST" && path === "/api/account/register") return registerAccount(request, env);
  if (request.method === "POST" && path === "/api/account/verify-email") return verifyAccountEmail(request, env);
  if (request.method === "POST" && path === "/api/account/resend-code") return resendAccountCode(request, env);
  if (request.method === "POST" && path === "/api/account/request-password-reset") return requestPasswordReset(request, env);
  if (request.method === "POST" && path === "/api/account/reset-password") return resetPassword(request, env);
  if (request.method === "POST" && path === "/api/account/login") return accountLogin(request, env);
  if (request.method === "GET" && path === "/api/account/me") return accountDashboard(request, env);
  const offerMatch = path.match(/^\/api\/account\/offers\/([0-9a-f-]{36})$/u);
  if (offerMatch && request.method === "PATCH") return updateOfferResponse(request, env, offerMatch[1]);
  if (request.method === "POST" && path === "/api/account/logout") {
    return json({ ok: true }, 200, { "set-cookie": "wcx_account=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0" });
  }

  if (request.method === "POST" && path === "/api/admin/login") return adminLogin(request, env);
  if (request.method === "GET" && path === "/api/admin/session") {
    return (await hasAdminSession(request, env)) ? json({ ok: true }) : errorResponse("Unauthorized.", 401);
  }
  if (request.method === "GET" && path === "/api/admin/applications") return listApplications(request, env);
  const adminAccountMatch = path.match(/^\/api\/admin\/accounts\/([0-9a-f-]{36})$/u);
  if (adminAccountMatch && request.method === "DELETE") return deleteAccount(request, env, adminAccountMatch[1]);
  const adminApplicationMatch = path.match(/^\/api\/admin\/applications\/([0-9a-f-]{36})$/u);
  if (adminApplicationMatch && request.method === "DELETE") return deleteApplication(request, env, adminApplicationMatch[1]);
  const cdlDownloadMatch = path.match(/^\/api\/admin\/applications\/([0-9a-f-]{36})\/documents\/cdl$/u);
  if (cdlDownloadMatch && request.method === "GET") return downloadCdl(request, env, cdlDownloadMatch[1]);
  if (request.method === "GET" && path === "/api/admin/quotes") return adminQuotes(request, env);
  if (request.method === "POST" && path === "/api/admin/offers") return createDriverOffer(request, env);
  const adminQuoteMatch = path.match(/^\/api\/admin\/quotes\/([0-9a-f-]{36})$/u);
  if (adminQuoteMatch && request.method === "PATCH") return updateQuoteStatus(request, env, adminQuoteMatch[1]);
  if (request.method === "POST" && path === "/api/admin/logout") {
    return json({ ok: true }, 200, {
      "set-cookie": "wcx_admin=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0",
    });
  }
  return errorResponse("Not found.", 404);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      if (new URL(request.url).pathname.startsWith("/api/")) {
        const origin = allowedOrigin(request, env);
        if (!origin) return errorResponse("Origin not allowed.", 403);
        if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders(origin) });
        const response = await handleApi(request, env);
        const headers = new Headers(response.headers);
        for (const [key, value] of Object.entries(corsHeaders(origin))) headers.set(key, value);
        return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
      }
      return await env.ASSETS.fetch(request);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unknown error";
      console.error(JSON.stringify({ message: "request failed", error: message, path: new URL(request.url).pathname }));
      return errorResponse("Internal server error.", 500);
    }
  },
} satisfies ExportedHandler<Env>;
