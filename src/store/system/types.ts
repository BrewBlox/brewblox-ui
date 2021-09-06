import { TempUnit } from '@/shared-types';

export interface SystemConfig {
  keyboardLayout: string;
  experimental: boolean;
  showSidebarLayouts: boolean;
  homePage: string | null;
  builderTouchDelayed: 'dense' | 'always' | 'never';
  timeZone: { name: string; posixValue: string };
}

export interface UserUnits {
  temperature: TempUnit;
}
