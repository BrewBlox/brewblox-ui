<script lang="ts">
import { computed, defineComponent, onBeforeMount, ref } from 'vue';

import { useWidget } from '@/composables';
import { createDialog } from '@/utils/dialog';
import { JSQuantity, bloxQty } from '@/utils/quantity';

import { CountdownSession, CountdownWidget } from './types';

const DEFAULT_DURATION = 10 * 60 * 1000;

export default defineComponent({
  name: 'CountdownWidget',
  setup() {
    const { widget, config, saveConfig } = useWidget.setup<CountdownWidget>();

    const remaining = ref<number>(0);
    let tickTimer: NodeJS.Timer | null = null;

    const session = computed<CountdownSession | null>({
      get: () => config.value.session,
      set: (session) => saveConfig({ ...config.value, session }),
    });

    const baseDuration = computed<number>({
      get: () => config.value.baseDuration,
      set: (baseDuration) => saveConfig({ ...config.value, baseDuration }),
    });

    const time = computed<string>(() => formatTime(remaining.value));
    const progress = computed<number>(() => {
      const duration: number =
        session.value?.duration || baseDuration.value || DEFAULT_DURATION;
      return remaining.value > 0
        ? Math.round((remaining.value / duration) * 100)
        : 100;
    });

    const size = computed<number>(() => {
      const dimension = widget.value.rows;
      return (dimension * 100 + (dimension - 1) * 20) / 4;
    });

    const color = computed<string>(() => {
      if (remaining.value < 0) {
        return 'negative';
      }
      if (progress.value < 30) {
        return 'warning';
      }
      return 'secondary';
    });

    function formatTime(remaining: number): string {
      let value: number = Math.abs(remaining);
      const sign = remaining < 0 ? '-' : '';
      const hour = Math.floor(value / 3600_000)
        .toString()
        .padStart(2, '0');
      value %= 3600_000;
      const min = Math.floor(value / 60_000)
        .toString()
        .padStart(2, '0');
      value %= 60_000;
      const sec = Math.floor(value / 1000)
        .toString()
        .padStart(2, '0');
      value %= 1000;
      const ds = Math.floor(value / 100)
        .toString()
        .padStart(1, '0');
      return `${sign}${hour}:${min}:${sec}.${ds}`;
    }

    function tick(): void {
      if (session.value) {
        const { startedAt, pausedDuration, duration, pausedAt } = session.value;
        const start = pausedAt || new Date().getTime();
        const end = new Date(startedAt + duration + pausedDuration).getTime();
        remaining.value = end - start;
      }
    }

    function startTick(): void {
      endTick();
      tickTimer = setInterval(tick, 10);
    }

    function endTick(): void {
      if (tickTimer) {
        clearInterval(tickTimer);
        tickTimer = null;
      }
    }

    function start(): void {
      if (session.value && !session.value.pausedAt) {
        return;
      }

      const activeSession: CountdownSession = session.value ?? {
        duration: baseDuration.value,
        startedAt: new Date().getTime(),
        pausedAt: null,
        pausedDuration: 0,
      };

      if (activeSession.pausedAt) {
        activeSession.pausedDuration +=
          new Date().getTime() - activeSession.pausedAt;
        activeSession.pausedAt = null;
      }

      startTick();
      session.value = activeSession;
    }

    function pause(): void {
      if (!session.value || session.value.pausedAt) {
        return;
      }
      endTick();
      const pausedAt = new Date().getTime();
      session.value = { ...session.value, pausedAt };
    }

    function reset(): void {
      createDialog({
        component: 'DurationQuantityDialog',
        componentProps: {
          modelValue: bloxQty(baseDuration.value, 'ms'),
          title: 'Reset countdown',
          message: 'Set initial countdown duration.',
          label: 'Duration',
        },
      }).onOk((duration: JSQuantity) => {
        endTick();
        const baseDuration: number = duration.to('ms').value!;
        remaining.value = baseDuration;
        saveConfig({
          baseDuration,
          session: null,
        });
      });
    }

    onBeforeMount(() => {
      if (session.value) {
        if (session.value.pausedAt) {
          tick(); // once to render intermediate
        } else {
          startTick();
        }
      } else {
        remaining.value = baseDuration.value;
      }
    });

    return {
      size,
      color,
      time,
      progress,
      start,
      pause,
      reset,
    };
  },
});
</script>

<template>
  <Card>
    <template #toolbar>
      <WidgetToolbar />
    </template>

    <div class="widget-body row q-mt-lg justify-center">
      <q-circular-progress
        :color="color"
        reverse
        :min="0"
        :max="100"
        :value="progress"
        :size="`${size}px`"
        :thickness="0.1"
      />
      <div class="col-break" />
      <div :class="['col-auto text-h2', `text-${color}`]">
        {{ time }}
      </div>
      <div class="col-break" />
      <q-btn
        flat
        label="Start"
        @click="start"
      />
      <q-btn
        flat
        label="Stop"
        @click="pause"
      />
      <q-btn
        flat
        label="Reset"
        @click="reset"
      />
    </div>
  </Card>
</template>
