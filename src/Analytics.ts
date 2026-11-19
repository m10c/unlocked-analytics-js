import type { CommonFields, ContextFields, ConfigOptions } from './types';
import Queue from './Queue';
import Config from './Config';
import { formatISO } from 'date-fns';

export default class Analytics {
  #config: Config;

  #queue: Queue;

  constructor() {
    this.#config = new Config();
    this.#queue = new Queue(this.#config);
  }

  load(writeKey: string, endpointUrl: string): void {
    this.#config.writeKey = writeKey;
    this.#config.endpointUrl = endpointUrl;
  }

  setContext(context: ContextFields): void {
    this.#config.context = context;
  }

  /**
   * While disabled, track and screen calls are dropped.
   */
  setEnabled(enabled: boolean): void {
    this.#config.enabled = enabled;
  }

  /**
   * Properties added to every track and screen call.
   */
  setProperties(properties: {}): void {
    this.#config.properties = properties;
  }

  mergeOptions(options: ConfigOptions): void {
    // Force a flush on old data before the options change
    this.#queue.flush();
    this.#config.options = { ...this.#config.options, ...options };
  }

  screen(name: string, properties?: {}, options?: CommonFields): void {
    if (!this.#config.enabled) return;
    this.#queue.push({
      type: 'screen',
      name,
      properties: { ...this.#config.properties, ...properties },
      ...options,
      timestamp: formatISO(new Date()),
    });
  }

  track(event: string, properties?: {}, options?: CommonFields): void {
    if (!this.#config.enabled) return;
    this.#queue.push({
      type: 'track',
      event,
      properties: { ...this.#config.properties, ...properties },
      ...options,
      timestamp: formatISO(new Date()),
    });
  }
}
