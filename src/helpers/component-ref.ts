import Vue, { VueConstructor } from 'vue';

export const ref =
  (component: VueConstructor): string => {
    Vue.component(component.name, component);
    return component.name;
  };

// Globally register all vue components in the RequireContext
export const autoRegister =
  (context: __WebpackModuleApi.RequireContext): void =>
    context
      .keys()
      .forEach(
        (fileName: string) => {
          const match = fileName.match(/([\w\-]+)\.vue$/);
          if (match) {
            const componentConfig = context(fileName);
            Vue.component(match[1], componentConfig.default || componentConfig);
          }
        });

export const autoComponents =
  (context: __WebpackModuleApi.RequireContext): { [name: string]: VueConstructor } =>
    context
      .keys()
      .reduce(
        (acc: Mapped<VueConstructor>, fileName: string) => {
          const match = fileName.match(/([\w\-]+)\.vue$/);
          if (match) {
            const componentConfig = context(fileName);
            acc[match[1]] = componentConfig.default || componentConfig;
          }
          return acc;
        },
        {});
