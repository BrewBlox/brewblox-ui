import VueI18n from 'vue-i18n';
import messages from '../i18n';

export default ({ app, store, Vue }: PluginArguments) => {
  Vue.use(VueI18n);

  // Set i18n instance on app
  // This way we can use it in middleware and pages asyncData/fetch
  app.i18n = new VueI18n({
    locale: store.state.locale,
    fallbackLocale: 'en',
    messages,
  });
};
