import type { AnyCall } from './types';
import type Config from './Config';

const NETWORK_ERROR_MESSAGES = [
  'Failed to fetch', // Chrome/Edge
  'NetworkError when attempting to fetch resource', // Firefox
  'Load failed', // Safari
  'Network request failed', // React Native
];

function isNetworkError(err: unknown): boolean {
  if (
    err instanceof TypeError &&
    // .startsWith because Sentry appends the host to the error message
    NETWORK_ERROR_MESSAGES.some((msg) => err.message.startsWith(msg))
  ) {
    return true;
  }
  return false;
}

export default class Queue {
  #config: Config;
  #queue: AnyCall[] = [];
  #flushTimeout: any | null = null;

  constructor(config: Config) {
    this.#config = config;
  }

  push(call: AnyCall): void {
    this.#queue = [...this.#queue, call];
    if (!this.#flushTimeout) {
      this.#flushTimeout = setTimeout(this.flush, 10000);
    }
    this._checkFlush();
  }

  _checkFlush(): void {
    if (this.#queue.length > 10) {
      this.flush();
    }
  }

  flush = async (): Promise<void> => {
    if (!this.#config.endpointUrl) {
      throw new Error(
        "[unlocked-analytics] endpointUrl is missing.  Make sure you've called analytics.load"
      );
    }
    if (!this.#config.writeKey) {
      throw new Error(
        "[unlocked-analytics] writeKey is missing.  Make sure you've called analytics.load"
      );
    }

    if (this.#queue.length === 0) {
      return;
    }

    if (this.#flushTimeout) {
      clearTimeout(this.#flushTimeout);
      this.#flushTimeout = null;
    }

    // Take the batch out of the queue so overlapping flushes send disjoint events
    const batch = this.#queue;
    this.#queue = [];
    const payload = { batch, context: this.#config.context };
    const headers = {
      'Content-Type': 'application/json',
      ...(this.#config.options.headers || {}),
    };

    try {
      const response = await fetch(`${this.#config.endpointUrl}/batch`, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers,
        // Lets the request finish when the page is being unloaded
        keepalive: true,
        ...(this.#config.options.credentials
          ? { credentials: this.#config.options.credentials }
          : {}),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
    } catch (err) {
      this.#queue = [...batch, ...this.#queue];
      if (!isNetworkError(err)) {
        throw err;
      }
    }
  };
}
