export class IntegrationHttpError extends Error {
  constructor(
    message: string,
    readonly provider: string,
    readonly url: string,
    readonly status?: number
  ) {
    super(message);
  }
}

export async function fetchJson<T>(
  provider: string,
  url: URL,
  timeoutMs = 8000
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new IntegrationHttpError(
        `${provider} returned HTTP ${response.status}`,
        provider,
        url.toString(),
        response.status
      );
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof IntegrationHttpError) {
      throw error;
    }

    throw new IntegrationHttpError(
      error instanceof Error ? error.message : `${provider} request failed`,
      provider,
      url.toString()
    );
  } finally {
    clearTimeout(timeout);
  }
}
