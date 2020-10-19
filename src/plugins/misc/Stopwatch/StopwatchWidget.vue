<script lang="ts">
import { Component } from 'vue-property-decorator';

import WidgetBase from '@/components/WidgetBase';

import { StopwatchConfig, StopwatchSession } from './types';


@Component
export default class StopwatchWidget extends WidgetBase<StopwatchConfig> {
  time: string = '00:00:00.0';
  tickTimer: NodeJS.Timer | null = null;

  created(): void {
    if (this.running) {
      this.startTick();
    }
  }

  get session(): StopwatchSession | null {
    return this.config.session;
  }

  get running(): boolean {
    return !!this.session?.running;
  }

  start(): void {
    if (this.running) {
      return;
    }

    const session = this.session ?? {
      timeStarted: new Date().getTime(),
      timeStopped: null,
      stoppedDuration: 0,
      running: true,
    };

    if (session.timeStopped) {
      session.stoppedDuration += (new Date().getTime() - session.timeStopped);
    }

    session.running = true;
    this.startTick();
    this.saveConfig({ session });
  }

  startTick(): void {
    this.endTick();
    this.tickTimer = setInterval(this.tick, 10);
  }

  endTick(): void {
    if (this.tickTimer) {
      clearInterval(this.tickTimer);
      this.tickTimer = null;
    }
  }

  tick(): void {
    if (this.session) {
      const { timeStarted, stoppedDuration } = this.session;
      const now = new Date().getTime();
      const elapsed = new Date(now - timeStarted - stoppedDuration);
      const hour = elapsed.getUTCHours().toString().padStart(2, '0');
      const min = elapsed.getUTCMinutes().toString().padStart(2, '0');
      const sec = elapsed.getUTCSeconds().toString().padStart(2, '0');
      const ms = Math.floor(elapsed.getUTCMilliseconds() / 100).toString().padStart(1, '0');
      this.time = `${hour}:${min}:${sec}.${ms}`;
    }
  }

  stop(): void {
    if (!this.session) {
      return;
    }
    this.session.running = false;
    this.session.timeStopped = new Date().getTime();
    this.endTick();
    this.saveConfig();
  }

  reset(): void {
    if (!this.session) {
      return;
    }
    this.endTick();
    this.saveConfig({ session: null });
    this.time = '00:00:00.0';
  }
}
</script>

<template>
  <CardWrapper v-bind="{context}">
    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" />
    </template>

    <div class="widget-body row q-mt-lg">
      <div class="col text-h2 text-center text-secondary">
        {{ time }}
      </div>
      <div class="col-break" />
      <div class="col row justify-center">
        <q-btn flat label="Start" @click="start" />
        <q-btn flat label="Stop" @click="stop" />
        <q-btn flat label="Reset" @click="reset" />
      </div>
    </div>
  </CardWrapper>
</template>
