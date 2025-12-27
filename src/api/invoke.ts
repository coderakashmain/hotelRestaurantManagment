type InvokeResponse<T = any> = T & { error?: string };

export async function safeInvoke<T = any>(
  channel: string,
  payload?: any
): Promise<T> {
  const res: InvokeResponse<T> = await window.api.invoke(channel, payload);

  if (res && typeof res === "object" && "error" in res) {
    throw new Error(res.error);
  }

  return res;
}
