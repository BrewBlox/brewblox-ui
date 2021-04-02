<script lang="ts">
import { Notify } from 'quasar';
import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';

import { startChangeTempUnit, systemStore } from '@/store/system';


@Component
export default class ConfigWatcher extends Vue {
  notifyHandle: Function | null = null;

  get userDefinedUnits(): boolean {
    return systemStore.userDefinedUnits;
  }

  showPrompt(): void {
    this.notifyHandle = Notify.create({
      message: 'Please set your temperature unit preference',
      timeout: 0,
      actions: [
        {
          label: 'Edit',
          textColor: 'white',
          handler: () => startChangeTempUnit().onCancel(this.showPrompt),
        },
      ],
    });
  }

  @Watch('userDefinedUnits')
  checkUserDefined(newV: boolean): void {
    if (!newV) {
      this.showPrompt();
    }
    else if (this.notifyHandle) {
      this.notifyHandle();
      this.notifyHandle = null;
    }
  }

  render(): null {
    return null;
  }
}
</script>
