

import { autoRegister } from '@/helpers/component-ref';
import { fetchJson } from '@/helpers/fetch';

import { loggingStore } from './store';

export default {
  install() {
    autoRegister(require.context('./components', true, /[A-Z]\w+\.vue$/));
    [...Array(100)].forEach((_, idx) => {
      loggingStore.commitEntry({
        level: 'INFO',
        time: new Date(),
        message: `Hello, this is message ${idx}`,
      });
    });
    fetchJson('https://httpstat.us/502');
  },
};
