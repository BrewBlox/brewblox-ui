import Vue, { VueConstructor } from 'vue';

export const ref = (component: VueConstructor) => {
  Vue.component(component.name, component);
  return component.name;
};

export const autoRegister = (context: any) =>
  // Globally register all vue components in the RequireContext
  context
    .keys()
    .reduce(
      (acc: string[], fileName: string) => {
        const match = fileName.match(/(\w*).\w+$/);
        if (match) {
          const componentConfig = context(fileName);
          Vue.component(match[1], componentConfig.default || componentConfig);
          return [...acc, match[1].toString()];
        }
        return acc;
      },
      [],
    );
