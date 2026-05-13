export class IntegrationHttpError extends Error {
  constructor(
    message: string,
    readonly provider: string,
    readonly url: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'IntegrationHttpError';
  }
}

export interface FetchJsonOptions {
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
}

export async function fetchJson<T>(
  provider: string,
  url: URL,
  timeoutMsOrOptions: number | FetchJsonOptions = 8000,
): Promise<T> {
  const opts: FetchJsonOptions =
    typeof timeoutMsOrOptions === 'number'
      ? { timeoutMs: timeoutMsOrOptions }
      : timeoutMsOrOptions;

  const timeoutMs = opts.timeoutMs ?? 8000;
  const retries = opts.retries ?? 2;
  const retryDelayMs = opts.retryDelayMs ?? 500;

  let lastError: IntegrationHttpError | undefined;

  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) {
      await sleep(retryDelayMs * Math.pow(2, attempt - 1));
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, { signal: controller.signal });

      if (!response.ok) {
        const err = new IntegrationHttpError(
          `${provider} returned HTTP ${response.status}`,
          provider,
          url.toString(),
          response.status,
        );
        // Don't retry client errors — only transient 5xx or network failures
        if (response.status >= 400 && response.status < 500) throw err;
        lastError = err;
        continue;
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof IntegrationHttpError) throw error;
      lastError = new IntegrationHttpError(
        error instanceof Error ? error.message : `${provider} request failed`,
        provider,
        url.toString(),
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError!;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
