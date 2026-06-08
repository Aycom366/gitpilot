import axios, { type AxiosInstance } from "axios";

export interface TokenFns {
  getToken: () => string;
  getRefreshToken: () => string;
  setTokens: (accessToken: string, refreshToken: string) => void;
  removeTokens: () => void;
  /** Called after token refresh fails — typically redirect to login */
  onUnauthenticated?: () => void;
}

export function createApiClient(
  baseURL: string,
  tokenFns: TokenFns,
): AxiosInstance {
  const {
    getToken,
    getRefreshToken,
    setTokens,
    removeTokens,
    onUnauthenticated,
  } = tokenFns;

  const client = axios.create({ baseURL });

  client.interceptors.request.use((config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  client.interceptors.response.use(
    (response) => response.data,
    async (error) => {
      if (error.response?.status === 401) {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          removeTokens();
          onUnauthenticated?.();
          return Promise.reject(error);
        }
        try {
          const { data } = await axios.post(`${baseURL}/auth/refresh`, {
            refreshToken,
          });
          setTokens(data.accessToken, data.refreshToken);
          error.config.headers.Authorization = `Bearer ${data.accessToken}`;
          return client.request(error.config);
        } catch {
          removeTokens();
          onUnauthenticated?.();
        }
      }
      return Promise.reject(error);
    },
  );

  return client;
}
