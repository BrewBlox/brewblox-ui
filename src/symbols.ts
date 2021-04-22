import { InjectionKey, Ref, UnwrapRef } from 'vue';

import { BrewbloxDatabase } from './plugins/database';
import { BrewbloxEventbus } from './plugins/eventbus';
import { BrewbloxStartup } from './plugins/startup';
import { WidgetContext } from './store/features';

export const DenseKey: InjectionKey<Ref<boolean>> = Symbol('$dense');
export const TouchKey: InjectionKey<Ref<boolean>> = Symbol('$touch');
export const NowKey: InjectionKey<Ref<Date>> = Symbol('$now');
export const StartupKey: InjectionKey<BrewbloxStartup> = Symbol('$startup');
export const DatabaseKey: InjectionKey<BrewbloxDatabase> = Symbol('$database');
export const EventbusKey: InjectionKey<BrewbloxEventbus> = Symbol('$eventbus');
export const ContextKey: InjectionKey<UnwrapRef<WidgetContext>> = Symbol('$context');
export const WidgetIdKey: InjectionKey<string> = Symbol('$widgetId');
export const InvalidateKey: InjectionKey<() => void> = Symbol('$invalidate');
