import type { AccessToken } from "@twurple/auth";

const DEVICE_URL = "https://id.twitch.tv/oauth2/device";
const TOKEN_URL = "https://id.twitch.tv/oauth2/token";

export interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

export function requestDeviceCode(
  clientId: string,
  scope: string,
): Promise<DeviceCodeResponse> {
  const body = new URLSearchParams({
    client_id: clientId,
    scopes: scope,
  });
  return fetch(DEVICE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  }).then(async (res) => {
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Device code request failed: ${res.status} ${text}`);
    }
    return res.json() as Promise<DeviceCodeResponse>;
  });
}

export async function pollDeviceToken(
  clientId: string,
  clientSecret: string,
  deviceCode: string,
  intervalSec: number,
): Promise<AccessToken> {
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    device_code: deviceCode,
    grant_type: "urn:ietf:params:oauth:grant-type:device_code",
  });

  for (;;) {
    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    const data = (await res.json()) as {
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
      scope?: string[];
      message?: string;
    };

    if (res.ok && data.access_token) {
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token ?? null,
        expiresIn: data.expires_in ?? null,
        scope: data.scope ?? [],
        obtainmentTimestamp: Date.now(),
      };
    }
    if (data.message === "authorization_pending") {
      await new Promise((r) => setTimeout(r, intervalSec * 1000));
      continue;
    }
    throw new Error(
      `Device auth failed: ${res.status} ${data.message ?? "unknown"}`,
    );
  }
}
