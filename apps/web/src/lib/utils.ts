interface ApiError {
  response?: { data?: { message?: string; error?: string | { field: string; message: string }[] } };
}

export const parseError = (error: unknown): string => {
  const err = error as ApiError;
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.response?.data?.error) {
    const e = err.response.data.error;
    if (Array.isArray(e)) return e.map((x) => `${x.field}: ${x.message}`).join('; ');
    return e;
  }
  return 'Something went wrong. Please try again.';
};
