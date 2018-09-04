import { VueConstructor } from 'vue';

export interface Feature {
  widget?: VueConstructor,
  create?: VueConstructor,
  description?: string,
}
