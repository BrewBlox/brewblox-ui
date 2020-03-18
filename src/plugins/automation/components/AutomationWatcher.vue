<script lang="ts">
import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';

import { durationMs } from '@/helpers/functional';
import { systemStore } from '@/store/system';

import { automationStore } from '../store';

const validDuration = durationMs('60s');

@Component
export default class AutomationWatcher extends Vue {

  get now(): Date {
    return systemStore.now;
  }

  @Watch('now')
  checkEventDataFresh(): void {
    const last = automationStore.lastEvent;
    const stale = last && last.getTime() + validDuration < new Date().getTime();

    if (stale) {
      automationStore.invalidateEventData();
    }
  }

  render(): null {
    return null;
  }
}
</script>
