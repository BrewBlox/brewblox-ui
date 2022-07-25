<script lang="ts">
import { useWidget } from '@/composables';
import { computed, defineComponent, onBeforeMount, ref } from 'vue';
import { StopwatchSession, StopwatchWidget } from './types';

export default defineComponent({
  name: 'StopwatchWidget',
  setup() {
    const { config, saveConfig } = useWidget.setup<StopwatchWidget>();

    const time = ref<string>('00:00:00.0');
    let tickTimer: NodeJS.Timer | null = null;

    const session = computed<StopwatchSession | null>(
      () => config.value.session,
    );

    function renderTime(elapsed: number): void {
      let value: number = elapsed;
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
      time.value = `${hour}:${min}:${sec}.${ds}`;
    }

    function tick(): void {
      if (session.value) {
        const { timeStarted, stoppedDuration } = session.value;
        const now = new Date().getTime();
        renderTime(now - timeStarted - stoppedDuration);
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
      if (session.value?.running) {
        return;
      }

      const newSession = session.value ?? {
        timeStarted: new Date().getTime(),
        timeStopped: null,
        stoppedDuration: 0,
        running: true,
      };

      if (newSession.timeStopped) {
        newSession.stoppedDuration +=
          new Date().getTime() - newSession.timeStopped;
      }

      newSession.running = true;
      startTick();
      saveConfig({ session: newSession });
    }

    function stop(): void {
      if (!session.value) {
        return;
      }
      session.value.running = false;
      session.value.timeStopped = new Date().getTime();
      endTick();
      saveConfig({ session: session.value });
    }

    function reset(): void {
      if (!session.value) {
        return;
      }
      endTick();
      saveConfig({ session: null });
      time.value = '00:00:00.0';
    }

    onBeforeMount(() => {
      if (session.value) {
        const { running, timeStarted, stoppedDuration, timeStopped } =
          session.value;
        if (running) {
          startTick();
        } else if (timeStopped) {
          renderTime(timeStopped - timeStarted - stoppedDuration);
        }
      }
    });

    return {
      time,
      start,
      stop,
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

    <div class="widget-body row q-mt-lg">
      <div class="col text-h2 text-center text-secondary">
        {{ time }}
      </div>
      <div class="col-break" />
      <div class="col row justify-center">
        <q-btn
          flat
          label="Start"
          @click="start"
        />
        <q-btn
          flat
          label="Stop"
          @click="stop"
        />
        <q-btn
          flat
          label="Reset"
          @click="reset"
        />
      </div>
    </div>
  </Card>
</template>
