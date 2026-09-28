import { inject } from 'vue';
import { ShowBlockKey } from '@/symbols';
import { createBlockDialog } from '@/utils/block-dialog';

type ShowBlock = (blockId: Maybe<string>, chainOf?: string | null) => void;

export interface UseShowBlockComposable {
  setup(serviceId: string): ShowBlock;
}

/**
 * Shows a linked block: in the same block dialog when used in one,
 * otherwise in a new dialog.
 * `chainOf` is the block whose control chain it is opened from.
 */
export const useShowBlock: UseShowBlockComposable = {
  setup(serviceId: string): ShowBlock {
    const showInDialog = inject(ShowBlockKey, null);
    return (blockId, chainOf = null) => {
      if (!blockId) {
        return;
      }
      if (showInDialog) {
        showInDialog(blockId, chainOf);
      } else {
        createBlockDialog(
          { serviceId, id: blockId, type: null },
          { mode: 'Basic', chainOf },
        );
      }
    };
  },
};
