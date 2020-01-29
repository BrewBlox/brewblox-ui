<script lang="ts">
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { durationMs } from '@/helpers/functional';
import notify from '@/helpers/notify';
import { sparkStore } from '@/plugins/spark/store';
import { systemStore } from '@/store/system';

import { SparkService, SystemStatus } from '../types';

const snoozeDuration = durationMs('1d');
const updateValidDuration = durationMs('30s');

@Component
export default class SparkServiceWatcher extends Vue {
  notifiedUpdate = false;

  @Prop({ type: Object, required: true })
  public readonly service!: SparkService;

  get now(): Date {
    return systemStore.now;
  }

  get status(): SystemStatus | null {
    return sparkStore.status(this.service.id);
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

  @Watch('now')
  checkUpdateFresh(): void {
    const date = sparkStore.lastUpdate(this.service.id);
    const fresh = !!date && date.getTime() + updateValidDuration > new Date().getTime();

    if (!fresh && date) {
      sparkStore.invalidateBlocks(this.service.id);
    }
    if (!fresh || !this.status?.synchronize) {
      sparkStore.fetchServiceStatus(this.service.id);
    }
  }

  @Watch('status')
  handleStatusChange(status: SystemStatus): void {
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
