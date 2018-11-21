export const addVuexKey = (module: any) =>
  Object.entries(module)
    .forEach(([name, func]) => ((func as any)._vuexKey = name));
