import { createLocalVue, shallowMount } from '@vue/test-utils';
import Quasar, { Cookies } from 'quasar';
import VueRouter from 'vue-router';
import Vuex from 'vuex';

const mockSsrContext = (): any => {
  return {
    req: {
      headers: {},
    },
    res: {
      setHeader: () => undefined,
    },
  };
};

// https://eddyerburgh.me/mock-vuex-in-vue-unit-tests
export const mountQuasar = (component, options: any = {}): any => {
  const localVue = createLocalVue();
  const app = {};

  localVue.use(Vuex);
  localVue.use(VueRouter);
  localVue.use(Quasar as any);
  const store = new Vuex.Store({});
  const router = new VueRouter();

  if (options) {
    const ssrContext = options.ssr ? mockSsrContext() : null;

    if (options.cookies) {
      const cookieStorage = ssrContext ? Cookies.parseSSR(ssrContext) : Cookies;
      const cookies = options.cookies;
      Object.keys(cookies).forEach(key => {
        cookieStorage.set(key, cookies[key]);
      });
    }

    if (options.plugins) {
      options.plugins.forEach(plugin => {
        plugin({ app, store, router, Vue: localVue, ssrContext });
      });
    }
  }

  // mock vue-i18n
  const $t = (): void => { };
  const $tc = (): void => { };
  const $n = (): void => { };
  const $d = (): void => { };

  return shallowMount(component, {
    localVue: localVue,
    store,
    router,
    mocks: { $t, $tc, $n, $d },
    // Injections for Components with a QPage root Element
    provide: {
      pageContainer: true,
      layout: {
        header: {},
        right: {},
        footer: {},
        left: {},
      },
    },
  });
};
