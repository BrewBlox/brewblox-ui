import { TiltServiceStateEvent, TiltStateEvent } from '@/plugins/tilt/types';

export const isTiltServiceState = (
  data: unknown,
): data is TiltServiceStateEvent =>
  (data as TiltServiceStateEvent).type === 'Tilt.state.service';

export const isTiltState = (data: unknown): data is TiltStateEvent =>
  (data as TiltStateEvent).type === 'Tilt.state';

export const makeTiltId = (
  serviceId: string | null,
  mac: string | null,
): string => `${serviceId}:${mac}`;

export const splitTiltId = (tiltId: string): [serviceId: string, mac: string] =>
  tiltId.split(':', 2) as [string, string];
