import { BREWFATHER_ID } from './const';
import { BrewfatherStateEvent } from './types';

export const isBrewfatherState = (data: unknown): data is BrewfatherStateEvent =>
  (data as BrewfatherStateEvent).key === BREWFATHER_ID;
