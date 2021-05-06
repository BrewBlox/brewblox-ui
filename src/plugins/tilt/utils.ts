import { TiltStateEvent } from '@/plugins/tilt/types';

export const isTiltState = (data: unknown): data is TiltStateEvent =>
  (data as TiltStateEvent).type === 'Tilt.state';
