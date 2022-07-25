<script lang="ts">
import { NowKey } from '@/symbols';
import { durationMs } from '@/utils/quantity';
import { defineComponent, inject, watch } from 'vue';
import { useAutomationStore } from './store';

const validDuration = durationMs('60s');

export default defineComponent({
  name: 'AutomationWatcher',
  setup() {
    const automationStore = useAutomationStore();
    const now = inject(NowKey)!;

    watch(
      () => now.value,
      () => {
        const last = automationStore.lastEvent;
        const stale =
          last && last.getTime() + validDuration < new Date().getTime();

        if (stale) {
          automationStore.invalidateEventData();
        }
      },
    );

    return () => null;
  },
});
</script>
