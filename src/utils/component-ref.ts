import { App, Component } from 'vue';

/**
 * Globally register a Vue component.
 * It can then be used in components without first being imported and included.
 *
 * - https://v3.vuejs.org/guide/component-registration.html#component-registration
 *
 * The `name` property defined in `component` is used as global name.
 * An error will be thrown if the component does not define a name.
 *
 * @param app Active Vue App
 * @param component
 * @returns registered string name
 */
export function cref(app: App, component: Component): string {
  const name = component.name;
  if (!name) {
    throw new Error('Unable to register nameless component');
  }
  app.component(name, component);
  return name;
}

/**
 * Globally registers all Vue components found
 * in the provided Webpack context.
 * This function must be called with literal arguments,
 * as the context is processed during the build.
 *
 * - https://v3.vuejs.org/guide/component-registration.html#component-registration
 * - https://webpack.js.org/guides/dependency-management/#requirecontext
 *
 * @param app Active Vue App
 * @param context
 */
export function autoRegister(
  app: App,
  context: __WebpackModuleApi.RequireContext,
): void {
  context.keys().forEach((fileName: string) => {
    const match = fileName.match(/([\w\-]+)\.vue$/);
    if (match) {
      const componentConfig = context(fileName);
      const component = componentConfig.default || componentConfig;
      if (component.name !== undefined && component.name !== match[1]) {
        // eslint-disable-next-line no-console
        console.warn(
          `File name '${fileName}' doesn't match component name ${component.name}`,
        );
      }
      app.component(match[1], component);
    }
  });
}

/**
 * Detects and collects all Vue components found in the provided Webpack context.
 * Collected components are not globally registered, and must be declared in a component before use.
 *
 * - https://webpack.js.org/guides/dependency-management/#requirecontext
 *
 * @param context
 * @returns Dictionary of components, where key is component name.
 */
export function autoComponents(
  context: __WebpackModuleApi.RequireContext,
): Mapped<Component> {
  return context.keys().reduce((acc: Mapped<Component>, fileName: string) => {
    const match = fileName.match(/([\w\-]+)\.vue$/);
    if (match) {
      const componentConfig = context(fileName);
      const component = componentConfig.default || componentConfig;
      if (component.name !== undefined && component.name !== match[1]) {
        // eslint-disable-next-line no-console
        console.warn(
          `File name '${fileName}' doesn't match component name ${component.name}`,
        );
      }
      acc[match[1]] = component;
    }
    return acc;
  }, {});
}
