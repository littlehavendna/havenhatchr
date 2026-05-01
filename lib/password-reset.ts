import "server-only";

import { createHash, randomBytes } from "crypto";
import { getRequestAppUrl } from "@/lib/billing";
import { prisma } from "@/lib/prisma";

const PASSWORD_RESET_TTL_MS = 1000 * 60 * 30;
const PASSWORD_RESET_KEY_PREFIX = "password-reset:";

type PasswordResetValue = {
  userId: string;
  email: string;
  expiresAt: string;
  usedAt?: string | null;
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function getResetKey(tokenHash: string) {
  return `${PASSWORD_RESET_KEY_PREFIX}${tokenHash}`;
}

function isPasswordResetValue(value: unknown): value is PasswordResetValue {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.userId === "string" &&
    typeof candidate.email === "string" &&
    typeof candidate.expiresAt === "string"
  );
}

export async function createPasswordResetLink(request: Request, user: { id: string; email: string }) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);
  const resetUrl = new URL("/reset-password", getRequestAppUrl(request));
  resetUrl.searchParams.set("token", token);

  await prisma.systemSetting.upsert({
    where: { key: getResetKey(tokenHash) },
    create: {
      key: getResetKey(tokenHash),
      label: "Password reset token",
      description: "Temporary hashed password reset token.",
      value: {
        userId: user.id,
        email: user.email,
        expiresAt: expiresAt.toISOString(),
        usedAt: null,
      },
    },
    update: {
      value: {
        userId: user.id,
        email: user.email,
        expiresAt: expiresAt.toISOString(),
        usedAt: null,
      },
    },
  });

  return resetUrl.toString();
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const apiKey = process.env.MAILGUN_API_KEY?.trim();
  const domain = process.env.MAILGUN_DOMAIN?.trim();
  const from =
    process.env.MAILGUN_FROM_EMAIL?.trim() ||
    process.env.DEFAULT_FROM_EMAIL?.trim() ||
    "HavenHatchr <support@havenhatchr.com>";

  if (!apiKey || !domain) {
    return { sent: false, reason: "mailgun_not_configured" as const };
  }

  const formData = new URLSearchParams({
    from,
    to: email,
    subject: "Reset your HavenHatchr password",
    text: getPasswordResetText(resetUrl),
    html: getPasswordResetHtml(resetUrl),
  });

  const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData,
  });

  return { sent: response.ok, reason: response.ok ? null : "email_send_failed" as const };
}

function getPasswordResetText(resetUrl: string) {
  return `Hello,

We received a request to reset the password for your HavenHatchr account.

Reset your password using this secure link:
${resetUrl}

This link expires in 30 minutes.

If you did not request this, you can ignore this email. Your password will not change.

Need help?
Reply to this email or contact the HavenHatchr team.

HavenHatchr
HavenHatchr.com`;
}

function getPasswordResetHtml(resetUrl: string) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f7f2ff;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#2c3e50;">
    <div style="max-width:640px;margin:0 auto;padding:24px;">
      <div style="background:#ffffff;border:1px solid rgba(148,118,255,0.18);border-radius:18px;box-shadow:0 16px 40px rgba(31,41,55,0.09);padding:22px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
          <div style="width:34px;height:34px;border-radius:999px;background:radial-gradient(circle at 30% 20%,#ffffff 0,#d9c9ff 45%,#a995ff 100%);display:flex;align-items:center;justify-content:center;font-size:18px;">
            🐣
          </div>
          <div>
            <div style="font-size:22px;font-weight:700;color:#3c2d7a;line-height:1.1;">
              HavenHatchr
            </div>
            <div style="font-size:13px;color:#6c6c8c;">
              Account password reset
            </div>
          </div>
        </div>

        <h2 style="margin:14px 0 10px 0;font-size:18px;color:#33235f;">
          Reset your password
        </h2>

        <p style="margin:0 0 12px 0;font-size:14px;line-height:1.5;color:#3d3d5c;">
          We received a request to reset your HavenHatchr password.
        </p>

        <div style="margin:16px 0 18px 0;">
          <a href="${resetUrl}"
             style="display:inline-block;background:#6c5ce7;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:999px;font-size:14px;box-shadow:0 10px 24px rgba(108,92,231,0.26);">
            Reset password
          </a>
        </div>

        <p style="margin:0 0 10px 0;font-size:12.5px;line-height:1.5;color:#70708d;">
          If the button does not work, copy and paste this link into your browser.
        </p>

        <p style="margin:0 0 14px 0;font-size:12.5px;line-height:1.5;word-break:break-word;color:#4c36a5;">
          ${resetUrl}
        </p>

        <p style="margin:0;font-size:12.5px;line-height:1.5;color:#70708d;">
          This link expires in 30 minutes. If you did not request this, you can ignore this email. Your password will not change.
        </p>

        <div style="margin-top:18px;padding-top:14px;border-top:1px solid rgba(148,118,255,0.18);font-size:12.5px;color:#6a5d93;">
          HavenHatchr<br />
          <span style="color:#9a8fc7;">HavenHatchr.com</span>
        </div>
      </div>
    </div>
  </body>
</html>`;
}

export async function consumePasswordResetToken(token: string) {
  const tokenHash = hashToken(token);
  const key = getResetKey(tokenHash);
  const setting = await prisma.systemSetting.findUnique({
    where: { key },
    select: { value: true },
  });

  if (!isPasswordResetValue(setting?.value)) {
    return null;
  }

  if (setting.value.usedAt || new Date(setting.value.expiresAt) <= new Date()) {
    return null;
  }

  await prisma.systemSetting.update({
    where: { key },
    data: {
      value: {
        ...setting.value,
        usedAt: new Date().toISOString(),
      },
    },
  });

  return setting.value;
}
