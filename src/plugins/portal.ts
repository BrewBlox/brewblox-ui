import * as PortalVue from 'portal-vue';
import Vue from 'vue';

export default (_: PluginArguments) => {
  Vue.use(PortalVue);
};
