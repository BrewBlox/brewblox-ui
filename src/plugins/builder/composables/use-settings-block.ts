import {
  Block,
  BlockType,
  DigitalActuatorBlock,
  FastPwmBlock,
} from 'brewblox-proto/ts';
import { computed, ComputedRef, inject } from 'vue';
import { useBlockSpecStore, useSparkStore } from '@/plugins/spark/store';
import {
  BlockAddress,
  BlockStatus,
  ComparedBlockType,
} from '@/plugins/spark/types';
import { isBlockCompatible, isCompatible } from '@/plugins/spark/utils/info';
import { createBlockDialog } from '@/utils/block-dialog';
import { createDialog } from '@/utils/dialog';
import { durationMs } from '@/utils/quantity';
import { PartKey, PatchSettingsKey } from '../symbols';
import { settingsAddress, showAbsentBlock } from '../utils';

export interface UseSettingsBlockComponent<BlockT extends Block> {
  hasAddress: ComputedRef<boolean>;
  address: ComputedRef<BlockAddress>;
  block: ComputedRef<BlockT | null>;
  blockStatus: ComputedRef<BlockStatus | null>;
  isBroken: ComputedRef<boolean>;
  isClaimed: ComputedRef<boolean>;
  showBlockDialog: () => void;
  showBlockSelectDialog: () => void;
  patchBlock(
    data: Partial<BlockT['data']>,
    softStartRefresh?: boolean,
  ): Promise<void>;
}

export interface UseSettingsBlockComposable {
  setup<BlockT extends Block>(
    settingsKey: string,
    intf: ComparedBlockType,
  ): UseSettingsBlockComponent<BlockT>;
}

export const useSettingsBlock: UseSettingsBlockComposable = {
  setup<BlockT extends Block>(
    settingsKey: string,
    intf: ComparedBlockType,
  ): UseSettingsBlockComponent<BlockT> {
    const sparkStore = useSparkStore();
    const specStore = useBlockSpecStore();
    const part = inject(PartKey)!;
    const patchSettings = inject(PatchSettingsKey, () => {});

    const address = computed<BlockAddress>(() =>
      settingsAddress(part.value, settingsKey),
    );

    const block = computed<BlockT | null>(() => {
      const actual = sparkStore.blockByAddress<BlockT>(address.value);
      return actual && isCompatible(actual.type, intf) ? actual : null;
    });

    function scheduleSoftStartRefresh(v: Maybe<Block>): void {
      if (
        isBlockCompatible<FastPwmBlock | DigitalActuatorBlock>(v, [
          BlockType.FastPwm,
          BlockType.DigitalActuator,
        ])
      ) {
        const softStartDuration = durationMs(v.data.transitionDurationValue);
        if (softStartDuration > 0) {
          setTimeout(() => sparkStore.fetchBlock(v), softStartDuration);
        }
      }
    }

    async function patchBlock(
      data: Partial<BlockT['data']>,
      softStartRefresh = false,
    ): Promise<void> {
      await sparkStore.patchBlock(block.value, data);
      if (softStartRefresh) {
        scheduleSoftStartRefresh(block.value);
      }
    }

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

    const isClaimed = computed<boolean>(
      () => block.value?.data.claimedBy?.id != null,
    );

    function showBlockDialog(): void {
      block.value != null
        ? createBlockDialog(block.value, { mode: 'Basic' })
        : showAbsentBlock(part.value, settingsKey);
    }

    function showBlockSelectDialog(): void {
      createDialog({
        component: 'BlockAddressDialog',
        componentProps: {
          modelValue: { ...address.value },
          title: 'Choose a Block',
          anyService: true,
          clearable: true,
          compatible: intf,
        },
      }).onOk((addr: BlockAddress) => {
        patchSettings({ [settingsKey]: addr });
      });
    }

    return {
      hasAddress,
      address,
      block,
      blockStatus,
      isBroken,
      isClaimed,
      showBlockDialog,
      showBlockSelectDialog,
      patchBlock,
    };
  },
};
