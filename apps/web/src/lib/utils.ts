export const parseError = (error: unknown): string => {
  const err = error as any;
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.response?.data?.error) {
    const e = err.response.data.error;
    if (Array.isArray(e)) return e.map((x: any) => `${x.field}: ${x.message}`).join('; ');
    return e;
  }
  return 'Something went wrong. Please try again.';
};
