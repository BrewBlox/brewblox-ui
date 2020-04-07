<script lang="ts">
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { durationMs } from '@/helpers/functional';
import notify from '@/helpers/notify';
import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';
import { systemStore } from '@/store/system';

import { SparkService, SparkStatus } from '../types';

const snoozeDuration = durationMs('1d');
const updateValidDuration = durationMs('30s');

@Component
export default class SparkServiceWatcher extends Vue {
  notifiedUpdate = false;

  @Prop({ type: Object, required: true })
  public readonly service!: SparkService;

  get sparkModule(): SparkServiceModule | null {
    return sparkStore.serviceById(this.service.id);
  }

  get now(): Date {
    return systemStore.now;
  }

  get status(): SparkStatus | null {
    return this.sparkModule?.status ?? null;
  }

  get cookieName(): string {
    return `fw-snooze-${this.service.id}`;
  }

  get snoozeTime(): number {
    if (!this.$q.cookies.has(this.cookieName)) {
      return 0;
    }
    return Date.parse(this.$q.cookies.get(this.cookieName));
  }

  fresh(date: Date | null): boolean {
    return !!date && date.getTime() + updateValidDuration > new Date().getTime();
  }

  @Watch('now')
  checkBlocksFresh(): void {
    if (!this.sparkModule) {
      return;
    }
    const blocksDate = this.sparkModule.lastBlocks;
    const statusDate = this.sparkModule.lastStatus;
    const blocksFresh = this.fresh(blocksDate);
    const statusFresh = this.fresh(statusDate);

    // The last received set of blocks are stale.
    // Remove them.
    if (!blocksFresh && blocksDate) {
      this.sparkModule.invalidateBlocks();
    }

    // The last received status update is stale.
    // Query the service for an update.
    if (!statusFresh) {
      this.sparkModule.fetchAll();
    }
  }

  @Watch('status')
  handleStatusChange(status: SparkStatus): void {
    if (this.notifiedUpdate
      || !status
      || !status.connect
      || status.latest
      || this.snoozeTime > new Date().getTime() - snoozeDuration
    ) {
      return;
    }

    this.notifiedUpdate = true;
    notify.info({
      timeout: 0,
      icon: 'mdi-download-network',
      message: `Firmware update available for ${this.service.title}`,
      actions: [
        {
          label: 'Update',
          textColor: 'white',
          handler: () => createDialog({
            component: 'FirmwareUpdateDialog',
            serviceId: this.service.id,
          }),
        },
        {
          label: 'Dismiss',
          textColor: 'white',
        },
        {
          label: 'Maybe tomorrow',
          textColor: 'white',
          handler: () => this.$q.cookies.set(this.cookieName, new Date().toUTCString()),
        },
      ],
    });
  }

  render(): null {
    return null;
  }
}
</script>
