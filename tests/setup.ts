import '@/quasar';

import fs from 'fs';
import path from 'path';
import { VueConstructor } from 'vue';

import { installFilters } from '@/plugins/spark/helpers';

export function jestAutoRegister(
  Vue: VueConstructor,
  directory: string,
  matcher: string | RegExp = /[A-Z]\w+\.vue$/
): string[] {
  const files: string[] = [];

  const readDirectory = (dir: string) =>
    fs.readdirSync(dir)
      .forEach(file => {
        const fullPath = path.resolve(dir, file);

        if (fs.statSync(fullPath).isDirectory()) {
          readDirectory(fullPath);
          return;
        }

        if (!file.match(matcher)) {
          return;
        }

        const match = file.match(/(\w*).\w+$/);
        if (match) {
          Vue.component(match[1], () => import(fullPath));
          files.push(match[1].toString());
        }
      });

  readDirectory(directory);
  return files;
}

export function setupSpark(Vue: VueConstructor) {
  jestAutoRegister(Vue, 'src/components');
  jestAutoRegister(Vue, 'src/plugins/spark/components');

  installFilters(Vue);
}
