import { GravityUnit, TempUnit } from 'brewblox-proto/ts';
import { ref } from 'vue';

export interface UserUISettings {
  keyboardLayout: string;
  experimental: boolean;
  homePage: string | null;
  builderTouchDelayed: 'dense' | 'always' | 'never';
  timeFormat: 'auto' | '12h' | '24h';
}

export interface UserUnits {
  temperature: TempUnit;
  gravity: GravityUnit;
}

export interface UserTimeZone {
  name: string;
  posixValue: string;
}

export const defaultUserUISettings = (): UserUISettings => ({
  keyboardLayout: 'english',
  experimental: false,
  homePage: null,
  builderTouchDelayed: 'dense',
  timeFormat: 'auto',
});

export const defaultUserUnits = (): UserUnits => ({
  temperature: 'degC',
  gravity: 'G',
});

export const defaultUserTimeZone = (): UserTimeZone => ({
  name: 'Etc/UTC',
  posixValue: 'UTC0',
});

export const startupDone = ref(false);
export const userUnitsDefined = ref(true);

export const userUISettings = ref(defaultUserUISettings());
export const userUnits = ref(defaultUserUnits());
export const userTimeZone = ref(defaultUserTimeZone());
