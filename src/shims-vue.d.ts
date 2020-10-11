import Vue from 'vue';

import { BrewbloxDatabase } from './plugins/database';
import { BrewbloxEventbus } from './plugins/eventbus';
import { BrewbloxStartup } from './plugins/startup';

declare module 'vue/types/vue' {
  interface Vue {
    $dense: boolean;
  }
  interface VueConstructor {
    $database: BrewbloxDatabase;
    $eventbus: BrewbloxEventbus;
    $startup: BrewbloxStartup;
  }
}
