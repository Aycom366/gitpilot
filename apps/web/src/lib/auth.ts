import Cookies from "js-cookie";

const TOKEN_KEY = "gitpilot-token";
const REFRESH_KEY = "gitpilot-refresh-token";

export const setTokens = (accessToken: string, refreshToken: string) => {
  Cookies.set(TOKEN_KEY, accessToken, {
    expires: 1,
    secure: true,
    sameSite: "lax",
  });
  Cookies.set(REFRESH_KEY, refreshToken, {
    expires: 7,
    secure: true,
    sameSite: "lax",
  });
};

export const getToken = () => Cookies.get(TOKEN_KEY) ?? "";
export const getRefreshToken = () => Cookies.get(REFRESH_KEY) ?? "";

export const removeTokens = () => {
  Cookies.remove(TOKEN_KEY);
  Cookies.remove(REFRESH_KEY);
};

export const isLoggedIn = () => !!getToken();
