import { ComputedRef, InjectionKey, Ref, UnwrapRef } from 'vue';
import { WidgetContext } from '@/store/features';
import { Widget } from './store/widgets';

export const DenseKey: InjectionKey<ComputedRef<boolean>> = Symbol();
export const TouchKey: InjectionKey<Ref<boolean>> = Symbol();
export const NowKey: InjectionKey<Ref<Date>> = Symbol();

export const ContextKey: InjectionKey<UnwrapRef<WidgetContext>> = Symbol();
export const WidgetKey: InjectionKey<ComputedRef<Widget>> = Symbol();
export const PatchWidgetKey: InjectionKey<
  (patch: Partial<Widget>) => Awaitable<void>
> = Symbol();
export const ChangeWidgetTitleKey: InjectionKey<() => void> = Symbol();

export const InvalidateKey: InjectionKey<(reason?: string) => void> = Symbol();
export const VolatileKey: InjectionKey<boolean> = Symbol();
