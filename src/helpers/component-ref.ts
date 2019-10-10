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


export async function externalComponent(url: string): Promise<any> {
  const match = url.split('/').reverse()[0].match(/^(.*?)\.umd/);
  if (match === null) {
    throw new Error('Invalid URL');
  }
  const name = match[1];
  const win: any = window;

  if (win[name]) {
    return win[name].default || win[name];
  };

  win[name] = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.async = true;
    script.addEventListener('load', () => {
      resolve(win[name].default || win[name]);
    });
    script.addEventListener('error', () => {
      reject(new Error(`Error loading ${url}`));
    });
    script.src = url;
    document.head.appendChild(script);
  });

  return win[name];
}
