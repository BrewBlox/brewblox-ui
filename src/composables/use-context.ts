import { ComputedRef, UnwrapRef, computed, inject } from 'vue';

import { WidgetContext } from '@/store/features';
import { ContextKey } from '@/symbols';

export interface UseContextComponent {
  context: UnwrapRef<WidgetContext>;
  inDialog: ComputedRef<boolean>;
  toggleMode(): void;
}

export interface UseContextComposable {
  setup(): UseContextComponent;
}

export const useContext: UseContextComposable = {
  setup() {
    const context = inject(ContextKey)!;

    if (!context) {
      throw new Error('No widget context injected');
    }

    const inDialog = computed<boolean>(() => context.container === 'Dialog');

    function toggleMode(): void {
      context.mode = context.mode === 'Basic' ? 'Full' : 'Basic';
    }

    return {
      context,
      inDialog,
      toggleMode,
    };
  },
};
