import { computed, ComputedRef } from 'vue';

import { Block, BlockAddress, ComparedBlockType } from '@/plugins/spark/types';

import { FlowPart } from '../types';
import { settingsAddress, settingsBlock } from '../utils';

export interface useSettingsBlockComponent<BlockT extends Block> {
  hasAddress: ComputedRef<boolean>;
  address: ComputedRef<BlockAddress>;
  block: ComputedRef<BlockT | null>;
  isBroken: ComputedRef<boolean>;
}

export interface useSettingsBlockComposable {
  setup<BlockT extends Block>(
    part: FlowPart,
    settingsKey: string,
    intf: ComparedBlockType,
  ): useSettingsBlockComponent<BlockT>;
}

export const useSettingsBlock: useSettingsBlockComposable = {
  setup<BlockT extends Block>(
    part: FlowPart,
    settingsKey: string,
    intf: ComparedBlockType,
  ): useSettingsBlockComponent<BlockT> {
    const address = computed<BlockAddress>(() =>
      settingsAddress(part, settingsKey),
    );

    const block = computed<BlockT | null>(() =>
      settingsBlock(part, settingsKey, intf),
    );

    const hasAddress = computed<boolean>(() => address.value.id !== null);

    const isBroken = computed<boolean>(
      () => block.value === null && hasAddress.value,
    );

    return {
      hasAddress,
      address,
      block,
      isBroken,
    };
  },
};
