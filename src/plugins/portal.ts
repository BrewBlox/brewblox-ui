import * as PortalVue from 'portal-vue';

export default ({ app, store, Vue }: PluginArguments) => {
  Vue.use(PortalVue);
};
