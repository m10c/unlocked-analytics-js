import type { ContextFields, ConfigOptions } from './types';

export default class Config {
  writeKey: string | undefined;
  endpointUrl: string | undefined;
  options: ConfigOptions = {};
  context: ContextFields = {};
}
