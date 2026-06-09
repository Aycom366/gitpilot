import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

/** Axios instance where response interceptor has already unwrapped response.data */
export interface UnwrappedAxiosInstance {
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T>;
  put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T>;
  patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T>;
  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
}

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
): UnwrappedAxiosInstance {
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
      // Skip refresh logic for auth endpoints — their 401s are meaningful
      // (wrong credentials, expired OTT, etc.) and should propagate as-is.
      const url: string = error.config?.url ?? "";
      if (error.response?.status === 401 && !url.includes("/auth/")) {
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

  return client as unknown as UnwrappedAxiosInstance;
}
