import { ComputedRef, InjectionKey, Ref, UnwrapRef } from 'vue';
import { WidgetContext } from '@/store/features';
import { Widget } from './store/widgets';

export const DenseKey: InjectionKey<ComputedRef<boolean>> = Symbol('$dense');
export const TouchKey: InjectionKey<Ref<boolean>> = Symbol('$touch');
export const NowKey: InjectionKey<Ref<Date>> = Symbol('$now');

export const ContextKey: InjectionKey<UnwrapRef<WidgetContext>> =
  Symbol('$context');
export const WidgetKey: InjectionKey<ComputedRef<Widget>> = Symbol('$widget');
export const PatchWidgetKey: InjectionKey<
  (patch: Partial<Widget>) => Awaitable<void>
> = Symbol('$patchWidget');
export const ChangeWidgetTitleKey: InjectionKey<() => void> =
  Symbol('$changeWidgetTitle');

export const InvalidateKey: InjectionKey<(reason?: string) => void> =
  Symbol('$invalidate');
export const VolatileKey: InjectionKey<boolean> = Symbol('$volatile');
