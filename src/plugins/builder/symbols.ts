import { ComputedRef, InjectionKey, ShallowRef } from 'vue';
import { BuilderPart, PartFlows } from './types';

export const PartKey: InjectionKey<ComputedRef<BuilderPart>> = Symbol('$part');
export const PatchPartKey: InjectionKey<(patch: Partial<BuilderPart>) => void> =
  Symbol('$patch-part');
export const PatchSettingsKey: InjectionKey<
  (patch: Partial<BuilderPart['settings']>) => void
> = Symbol('$patch-settings');
export const FlowsKey: InjectionKey<ShallowRef<Mapped<PartFlows>>> =
  Symbol('$flows');
export const InteractableKey: InjectionKey<ComputedRef<boolean>> =
  Symbol('$interactable');
export const ReflowKey: InjectionKey<() => void> = Symbol('$reflow');
export const PlaceholderKey: InjectionKey<boolean> = Symbol('$placeholder');
export const EditableKey: InjectionKey<boolean> = Symbol('$editable');
