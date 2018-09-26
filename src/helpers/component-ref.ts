import Vue, { VueConstructor } from 'vue';

export const ref = (component: VueConstructor) => {
  Vue.component(component.name, component);
  return component.name;
};
