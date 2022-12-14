import { useBlockSpecStore } from '@/plugins/spark/store';
import {
  BlockAddress,
  BlockStatus,
  ComparedBlockType,
} from '@/plugins/spark/types';
import { createBlockDialog } from '@/utils/block-dialog';
import { Block } from 'brewblox-proto/ts';
import { computed, ComputedRef, Ref } from 'vue';
import { FlowPart } from '../types';
import { settingsAddress, settingsBlock, showAbsentBlock } from '../utils';

export interface useSettingsBlockComponent<BlockT extends Block> {
  hasAddress: ComputedRef<boolean>;
  address: ComputedRef<BlockAddress>;
  block: ComputedRef<BlockT | null>;
  blockStatus: ComputedRef<BlockStatus | null>;
  isBroken: ComputedRef<boolean>;
  showBlockDialog: () => void;
}

export interface useSettingsBlockComposable {
  setup<BlockT extends Block>(
    part: Ref<FlowPart>,
    settingsKey: string,
    intf: ComparedBlockType,
  ): useSettingsBlockComponent<BlockT>;
}

export const useSettingsBlock: useSettingsBlockComposable = {
  setup<BlockT extends Block>(
    part: Ref<FlowPart>,
    settingsKey: string,
    intf: ComparedBlockType,
  ): useSettingsBlockComponent<BlockT> {
    const specStore = useBlockSpecStore();

    const address = computed<BlockAddress>(() =>
      settingsAddress(part.value, settingsKey),
    );

    const block = computed<BlockT | null>(() =>
      settingsBlock(part.value, settingsKey, intf),
    );

    const blockStatus = computed<BlockStatus | null>(() => {
      if (block.value == null) {
        return null;
      }
      const spec = specStore.blockSpecByType(block.value.type);
      return spec?.analyze(block.value) ?? null;
    });

    const hasAddress = computed<boolean>(() => address.value.id !== null);

    const isBroken = computed<boolean>(
      () => block.value === null && hasAddress.value,
    );

    function showBlockDialog(): void {
      block.value != null
        ? createBlockDialog(block.value, { mode: 'Basic' })
        : showAbsentBlock(part.value, settingsKey);
    }

    return {
      hasAddress,
      address,
      block,
      blockStatus,
      isBroken,
      showBlockDialog,
    };
  },
};
