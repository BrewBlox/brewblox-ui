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

export function globRegister(app: App, modules: Mapped<any>): void {
  Object.entries(modules).forEach(([path, component]) => {
    const match = path.match(/([\w\-]+)\.vue$/);
    if (match) {
      app.component(match[1], component.default);
    }
  });
}

export function globComponents(modules: Mapped<any>): Mapped<Component> {
  const entries = Object.entries(modules)
    .map(([path, component]) => {
      const match = path.match(/([\w\-]+)\.vue$/);
      if (match) {
        return [match[1], component.default];
      }
    })
    .filter((entry): entry is [string, Component] => entry != null);
  return Object.fromEntries(entries);
}
