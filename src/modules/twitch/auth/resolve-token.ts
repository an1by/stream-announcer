import { getTokenInfo, type AccessToken } from "@twurple/auth";
import { requestDeviceCode, pollDeviceToken } from "./device-flow.js";
import { saveAuthData } from "./storage.js";
import type { SavedAuth } from "./storage.js";

export interface ResolvedToken {
  token: AccessToken;
  userId: string;
}

export async function getOrRequestUserToken(
  clientId: string,
  clientSecret: string,
  savedAuth: SavedAuth | null,
  scope: string,
): Promise<ResolvedToken> {
  if (savedAuth) {
    const token: AccessToken = {
      accessToken: savedAuth.accessToken,
      refreshToken: savedAuth.refreshToken,
      expiresIn: savedAuth.expiresIn,
      obtainmentTimestamp: savedAuth.obtainmentTimestamp,
      scope: savedAuth.scope,
    };
    return { token, userId: savedAuth.userId };
  }

  return runDeviceFlow(clientId, clientSecret, scope);
}

async function runDeviceFlow(
  clientId: string,
  clientSecret: string,
  scope: string,
): Promise<ResolvedToken> {
  console.log("Token not found. Starting auth via Twitch Device Flow.\n");

  const { device_code, user_code, verification_uri, interval } =
    await requestDeviceCode(clientId, scope);

  console.log("Open in browser:");
  console.log(verification_uri);
  console.log("\nEnter code:", user_code);
  console.log("\nWaiting for authorization...\n");

  const token = await pollDeviceToken(
    clientId,
    clientSecret,
    device_code,
    interval,
  );
  const info = await getTokenInfo(token.accessToken, clientId);
  if (!info.userId) throw new Error("Device flow token has no user id");

  await saveAuthData(info.userId, token);
  console.log("Authorization successful. Data saved to twitch-auth.json\n");

  return { token, userId: info.userId };
}
