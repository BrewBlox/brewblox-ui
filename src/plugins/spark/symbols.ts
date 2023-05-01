import { Block } from 'brewblox-proto/ts';
import { ComputedRef, InjectionKey } from 'vue';

export const BlockKey: InjectionKey<ComputedRef<Block>> = Symbol('$block');
