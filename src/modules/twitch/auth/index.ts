import { RefreshingAuthProvider } from "@twurple/auth";
import { loadTwitchConfig, saveRefreshedToken } from "./storage";
import { getOrRequestUserToken } from "./resolve-token";

export async function createTwitchAuth() {
  const { clientId, clientSecret, savedAuth } = await loadTwitchConfig();
  const scope = Bun.env.TWITCH_SCOPE ?? "";
  const authProvider = new RefreshingAuthProvider({ clientId, clientSecret });
  const { token, userId } = await getOrRequestUserToken(
    clientId,
    clientSecret,
    savedAuth,
    scope,
  );
  authProvider.addUser(userId, token);
  authProvider.onRefresh((refreshedUserId, refreshedToken) => {
    saveRefreshedToken(refreshedUserId, refreshedToken);
  });
  return { authProvider, userId };
}

export * from "./device-flow";
export * from "./resolve-token";
export * from "./storage";