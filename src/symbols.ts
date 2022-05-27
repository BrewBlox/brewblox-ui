import { ComputedRef, InjectionKey, Ref, UnwrapRef } from 'vue';

import { WidgetContext } from '@/store/features';

export const DenseKey: InjectionKey<ComputedRef<boolean>> = Symbol('$dense');
export const TouchKey: InjectionKey<Ref<boolean>> = Symbol('$touch');
export const NowKey: InjectionKey<Ref<Date>> = Symbol('$now');

export const ContextKey: InjectionKey<UnwrapRef<WidgetContext>> =
  Symbol('$context');
export const WidgetIdKey: InjectionKey<string> = Symbol('$widgetId');
export const InvalidateKey: InjectionKey<() => void> = Symbol('$invalidate');
