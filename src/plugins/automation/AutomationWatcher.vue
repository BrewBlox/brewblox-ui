<script lang="ts">
import { defineComponent, inject, watch } from 'vue';

import { NowKey } from '@/symbols';
import { durationMs } from '@/utils/duration';

import { automationStore } from './store';

const validDuration = durationMs('60s');

export default defineComponent({
  name: 'AutomationWatcher',
  setup() {
    const now = inject(NowKey)!;

    watch(
      () => now.value,
      () => {
        const last = automationStore.lastEvent;
        const stale = last && last.getTime() + validDuration < new Date().getTime();

        if (stale) {
          automationStore.invalidateEventData();
        }
      },
    );

    return () => null;
  },
});
</script>
