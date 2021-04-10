import { InjectionKey, Ref } from 'vue';

import { BrewbloxDatabase } from './plugins/database';
import { BrewbloxEventbus } from './plugins/eventbus';
import { BrewbloxStartup } from './plugins/startup';

export const DenseKey: InjectionKey<Ref<boolean>> = Symbol('$dense');
export const TouchKey: InjectionKey<Ref<boolean>> = Symbol('$touch');
export const StartupKey: InjectionKey<BrewbloxStartup> = Symbol('$startup');
export const DatabaseKey: InjectionKey<BrewbloxDatabase> = Symbol('$database');
export const EventbusKey: InjectionKey<BrewbloxEventbus> = Symbol('$eventbus');
