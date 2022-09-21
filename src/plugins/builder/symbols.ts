import { InjectionKey, Ref, UnwrapRef } from 'vue';
import { FlowPart } from './types';

export const BuilderPartKey: InjectionKey<Ref<UnwrapRef<FlowPart>>> =
  Symbol('$part');
export const BuilderSavePartKey: InjectionKey<(part: FlowPart) => unknown> =
  Symbol('$savePart');
