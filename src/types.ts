export type ConfigOptions = {
  headers?: {};
};

export type ContextFields = {
  active?: boolean;
  app?: {
    name?: string;
    version?: string;
    build?: string;
    namespace?: string;
  };
  campaign?: {
    name?: string;
    source?: string;
    medium?: string;
    term?: string;
    content?: string;
  };
  device?: {
    id?: string;
    advertisingId?: string;
    adTrackingEnabled?: boolean;
    manufacturer?: string;
    model?: string;
    name?: string;
    type?: string;
    token?: string;
  };
  ip?: string;
  library?: {
    name?: string;
    version?: string;
  };
  locale?: string;
};

export type CommonFields = {
  anonymousId?: string;
  context?: ContextFields;
  timestamp?: string;
};

type TrackCall = CommonFields & {
  type: 'track';
  event: string;
  properties?: {};
};

type ScreenCall = CommonFields & {
  type: 'screen';
  name: string;
  properties?: {};
};

export type AnyCall = TrackCall | ScreenCall;
