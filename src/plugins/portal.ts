import Vue from 'vue';
import * as PortalVue from 'portal-vue';

export default (_: PluginArguments) => {
  Vue.use(PortalVue);
};
