import { ref } from 'vue';

import { GravityUnit, TempUnit } from '@/shared-types';

export interface UserUISettings {
  keyboardLayout: string;
  experimental: boolean;
  showSidebarLayouts: boolean;
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
  showSidebarLayouts: true,
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
export const userUnitsDefined = ref(false);

export const userUISettings = ref(defaultUserUISettings());
export const userUnits = ref(defaultUserUnits());
export const userTimeZone = ref(defaultUserTimeZone());
