<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';
import { PidBlock } from '@/shared-types';

import { TempControlConfig, TempControlMode } from './types';


@Component
export default class TempControlSyncDialog extends DialogBase {

  @Prop({ type: Object, required: true })
  public readonly config!: TempControlConfig;

  @Prop({ type: Function, required: true })
  public readonly saveConfig!: (config: TempControlConfig) => unknown;

  get module(): SparkServiceModule | null {
    return sparkStore.moduleById(this.config.serviceId);
  }

  get mode(): TempControlMode | null {
    return this.config.modes.find(v => v.id === this.config.activeMode) ?? null;
  }

  get coolPid(): PidBlock | null {
    return this.module?.blockByLink(this.config.coolPid) ?? null;
  }

  get heatPid(): PidBlock | null {
    return this.module?.blockByLink(this.config.heatPid) ?? null;
  }
}
</script>

<template>
  <q-dialog
    ref="dialog"
    :maximized="$dense"
    v-bind="dialogProps"
    @hide="onDialogHide"
  >
    <ActionCardWrapper v-bind="{context}">
      <template #toolbar>
        <DialogToolbar title="Sync PID settings" subtitle="Temperature control" />
      </template>

      <q-card-section class="row">
        todo
      </q-card-section>
    </ActionCardWrapper>
  </q-dialog>
</template>
