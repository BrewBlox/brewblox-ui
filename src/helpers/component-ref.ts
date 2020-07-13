import Vue, { VueConstructor } from 'vue';

export const ref =
  (component: VueConstructor): string => {
    Vue.component(component.name, component);
    return component.name;
  };

export const selector =
  (component: VueConstructor): (() => string) => {
    Vue.component(component.name, component);
    return () => component.name;
  };

// Globally register all vue components in the RequireContext
export const autoRegister =
  (context: __WebpackModuleApi.RequireContext): string[] =>
    context
      .keys()
      .reduce(
        (acc: string[], fileName: string) => {
          const match = fileName.match(/(\w*).\w+$/);
          if (match) {
            const componentConfig = context(fileName);
            Vue.component(match[1], componentConfig.default || componentConfig);
            acc.push(match[1].toString());
          }
          return acc;
        },
        [],
      );
