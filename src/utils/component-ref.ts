import { App, Component } from 'vue';

export const cref =
  (app: App, component: Component): string => {
    const name = component.name;
    if (!name) {
      throw new Error('Unable to register nameless component');
    }
    app.component(name, component);
    return name;
  };

// Globally register all vue components in the RequireContext
export const autoRegister =
  (app: App, context: __WebpackModuleApi.RequireContext): void =>
    context
      .keys()
      .forEach(
        (fileName: string) => {
          const match = fileName.match(/([\w\-]+)\.vue$/);
          if (match) {
            const componentConfig = context(fileName);
            app.component(match[1], componentConfig.default || componentConfig);
          }
        });

export const autoComponents =
  (context: __WebpackModuleApi.RequireContext): { [name: string]: Component } =>
    context
      .keys()
      .reduce(
        (acc: Mapped<Component>, fileName: string) => {
          const match = fileName.match(/([\w\-]+)\.vue$/);
          if (match) {
            const componentConfig = context(fileName);
            acc[match[1]] = componentConfig.default || componentConfig;
          }
          return acc;
        },
        {});
