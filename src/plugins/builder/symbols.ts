import { BuilderPart, PartFlows } from './types';
import type { ZoomTransform } from 'd3';
import { InjectionKey, ShallowRef, Ref, DeepReadonly } from 'vue';

export const PartKey: InjectionKey<DeepReadonly<Ref<BuilderPart>>> = Symbol();
export const PatchPartKey: InjectionKey<(patch: Partial<BuilderPart>) => void> =
  Symbol();
export const PatchSettingsKey: InjectionKey<
  (patch: Partial<BuilderPart['settings']>) => void
> = Symbol();
export const FlowsKey: InjectionKey<ShallowRef<Mapped<PartFlows>>> = Symbol();
export const InteractableKey: InjectionKey<DeepReadonly<Ref<boolean>>> =
  Symbol();
export const ReflowKey: InjectionKey<() => void> = Symbol();
export const PlaceholderKey: InjectionKey<boolean> = Symbol();
export const EditableKey: InjectionKey<boolean> = Symbol();
export const ZoomTransformKey: InjectionKey<DeepReadonly<Ref<ZoomTransform>>> =
  Symbol();
export const PortalIdKey: InjectionKey<string> = Symbol();
