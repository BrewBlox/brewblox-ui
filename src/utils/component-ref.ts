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

// Register all found vue components with the given App
export const autoRegister =
  (app: App, context: __WebpackModuleApi.RequireContext): void =>
    context
      .keys()
      .forEach(
        (fileName: string) => {
          const match = fileName.match(/([\w\-]+)\.vue$/);
          if (match) {
            const componentConfig = context(fileName);
            const component = componentConfig.default || componentConfig;
            if (component.name !== undefined && component.name !== match[1]) {
              // eslint-disable-next-line no-console
              console.warn(`File name '${fileName}' doesn't match component name ${component.name}`);
            }
            app.component(match[1], component);
          }
        });

// Return a collection of found vue components
// This does not register them in Vue itself.
export const autoComponents =
  (context: __WebpackModuleApi.RequireContext): Mapped<Component> =>
    context
      .keys()
      .reduce(
        (acc: Mapped<Component>, fileName: string) => {
          const match = fileName.match(/([\w\-]+)\.vue$/);
          if (match) {
            const componentConfig = context(fileName);
            const component = componentConfig.default || componentConfig;
            if (component.name !== undefined && component.name !== match[1]) {
              // eslint-disable-next-line no-console
              console.warn(`File name '${fileName}' doesn't match component name ${component.name}`);
            }
            acc[match[1]] = component;
          }
          return acc;
        },
        {});

// The same as autoComponents, but for TS files
// We don't need to check for a naming mismatch here
export const autoModules =
  <T>(context: __WebpackModuleApi.RequireContext): Mapped<T> =>
    context
      .keys()
      .reduce(
        (acc: Mapped<T>, fileName: string) => {
          const match = fileName.match(/([\w\-]+)\.ts$/);
          if (match) {
            const module = context(fileName);
            const exported = module.default || module;
            acc[match[1]] = exported;
          }
          return acc;
        },
        {});
