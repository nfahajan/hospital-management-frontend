import { TOKEN_KEY } from "./auth-utils";
import { removeFromLocalStorage, setToLocalStorage } from "./local-storage";
import setAccessToken, { clearAccessToken } from "./set-access-token";

export const setTokens = async (accessToken: string) => {
  // 1. Set in localStorage
  setToLocalStorage(TOKEN_KEY, accessToken);
  // 3. Set in server-side cookie
  await setAccessToken(accessToken);
};

export const clearTokens = async () => {
  // 1. Remove from localStorage
  removeFromLocalStorage(TOKEN_KEY);
  // 3. Clear server-side cookie
  await clearAccessToken();
};
