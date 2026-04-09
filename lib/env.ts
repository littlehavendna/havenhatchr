export function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  return value;
}

export function getAppBaseUrl() {
  const fallback = "http://localhost:3000";
  const configuredValue = process.env.NEXT_PUBLIC_APP_URL?.trim() || fallback;

  try {
    return new URL(configuredValue);
  } catch {
    return new URL(fallback);
  }
}

export function getAppOrigin() {
  return getAppBaseUrl().origin;
}

