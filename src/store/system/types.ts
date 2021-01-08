export interface SystemConfig {
  keyboardLayout: string;
  experimental: boolean;
  showSidebarLayouts: boolean;
  homePage: string | null;
  builderTouchDelayed: 'dense' | 'always' | 'never';
}
