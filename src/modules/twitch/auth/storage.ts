import { join } from "path";
import type { AccessToken } from "@twurple/auth";

const AUTH_FILE = "twitch-auth.json";

export interface SavedAuth {
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number | null;
  obtainmentTimestamp: number;
  scope: string[];
}

export interface TwitchConfig {
  clientId: string;
  clientSecret: string;
  savedAuth: SavedAuth | null;
}

function getAuthPath(): string {
  return join(process.cwd(), AUTH_FILE);
}

function parseSavedAuth(data: Record<string, unknown>): SavedAuth | null {
  if (
    typeof data?.userId === "string" &&
    typeof data?.accessToken === "string" &&
    typeof data?.refreshToken === "string"
  ) {
    return {
      userId: data.userId,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresIn: typeof data.expiresIn === "number" ? data.expiresIn : null,
      obtainmentTimestamp:
        typeof data.obtainmentTimestamp === "number"
          ? data.obtainmentTimestamp
          : 0,
      scope: Array.isArray(data.scope) ? data.scope : [],
    };
  }
  return null;
}

export async function loadTwitchConfig(): Promise<TwitchConfig> {
  const clientId = Bun.env.TWITCH_CLIENT_ID;
  const clientSecret = Bun.env.TWITCH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      "Set TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET in .env (from Twitch Developer Console).",
    );
  }

  let savedAuth: SavedAuth | null = null;
  const path = getAuthPath();
  try {
    const data = (await Bun.file(path).json()) as Record<string, unknown>;
    savedAuth = parseSavedAuth(data);
  } catch {
    // file missing or invalid JSON — will run Device Flow
  }
  return { clientId, clientSecret, savedAuth };
}

/** For backward compatibility: loads token data only if the file exists. */
export async function loadAuthData(): Promise<SavedAuth | null> {
  try {
    const config = await loadTwitchConfig();
    return config.savedAuth;
  } catch {
    return null;
  }
}

export async function saveAuthData(
  userId: string,
  token: AccessToken,
): Promise<void> {
  const path = getAuthPath();
  const data: SavedAuth = {
    userId,
    accessToken: token.accessToken,
    refreshToken: token.refreshToken ?? "",
    expiresIn: token.expiresIn,
    obtainmentTimestamp: token.obtainmentTimestamp,
    scope: token.scope ?? [],
  };
  await Bun.write(path, JSON.stringify(data, null, 2));
}

export async function saveRefreshedToken(
  userId: string,
  token: AccessToken,
): Promise<void> {
  await saveAuthData(userId, token);
}
