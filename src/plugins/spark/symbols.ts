import { Block } from 'brewblox-proto/ts';
import { ComputedRef, InjectionKey } from 'vue';
import type { BlockChain } from './utils/chains';

export const BlockKey: InjectionKey<ComputedRef<Block>> = Symbol();

/** The control chain a block widget shows, and the block it belongs to */
export const BlockChainKey: InjectionKey<
  ComputedRef<{ chain: BlockChain; anchor: string }>
> = Symbol();
