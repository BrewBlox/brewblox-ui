import { VueConstructor } from 'vue';

export interface Feature {
  widget?: VueConstructor;
  wizard?: VueConstructor;
  form?: VueConstructor;
  displayName?: string;
}
