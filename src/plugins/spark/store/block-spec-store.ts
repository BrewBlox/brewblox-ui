import { Block, BlockType, UserBlockType } from 'brewblox-proto/ts';
import { defineStore } from 'pinia';
import { shallowRef } from 'vue';
import {
  BlockAddress,
  BlockFieldAddress,
  BlockFieldSpec,
  BlockSpec,
  SpecificBlock,
} from '@/plugins/spark/types';
import { findByKey } from '@/utils/collections';

export const useBlockSpecStore = defineStore('blockSpecStore', () => {
  const blockSpecs = shallowRef<BlockSpec<any>[]>([]);
  const fieldSpecs = shallowRef<BlockFieldSpec[]>([]);

  // We're assuming here that a spec is registered for every user block type
  function blockSpecByType<T extends Block>(
    type: UserBlockType & T['type'],
  ): BlockSpec<T>;
  function blockSpecByType<T extends Block>(
    type: BlockType & T['type'],
  ): BlockSpec<T> | null;
  function blockSpecByType<T extends SpecificBlock>(
    type: T['type'],
  ): BlockSpec<SpecificBlock> | null {
    return findByKey<BlockSpec<T>>(blockSpecs.value, 'type', type);
  }

  function blockSpecByAddress<T extends Block>(
    addr: Maybe<T | BlockAddress>,
  ): BlockSpec<T> | null {
    return addr && addr.type
      ? blockSpecByType<T>(addr.type as T['type'])
      : null;
  }

  function addBlockSpec<T extends SpecificBlock>(spec: BlockSpec<T>): void {
    blockSpecs.value.push(spec as unknown as BlockSpec);
  }

  function fieldSpecsByType(type: Maybe<BlockType>): BlockFieldSpec[] {
    return fieldSpecs.value.filter((f) => f.type === type);
  }

  function fieldSpecByFieldAddress(
    addr: Maybe<BlockFieldAddress>,
  ): BlockFieldSpec | null {
    return addr && addr.type && addr.field
      ? fieldSpecs.value.find(
          (f) => f.type === addr.type && f.key === addr.field,
        ) ?? null
      : null;
  }

  function addFieldSpecs<T extends SpecificBlock>(
    specs: BlockFieldSpec<T>[],
  ): void {
    fieldSpecs.value.push(...specs);
  }

  return {
    blockSpecs,
    fieldSpecs,

    blockSpecByType,
    blockSpecByAddress,
    addBlockSpec,

    fieldSpecsByType,
    fieldSpecByFieldAddress,
    addFieldSpecs,
  };
});
