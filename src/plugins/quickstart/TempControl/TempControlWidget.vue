<script lang="ts">
import { Component } from 'vue-property-decorator';

import WidgetBase from '@/components/WidgetBase';
import { spliceById } from '@/helpers/functional';
import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';
import { SetpointProfileBlock } from '@/shared-types';

import TempControlBasic from './TempControlBasic.vue';
import TempControlFull from './TempControlFull.vue';
import { TempControlConfig, TempControlMode } from './types';

@Component({
  components: {
    Basic: TempControlBasic,
    Full: TempControlFull,
  },
})
export default class TempControlWidget extends WidgetBase<TempControlConfig> {
  controlToggle = true;
  profileToggle = true;

  get serviceOpts(): string[] {
    return sparkStore.serviceIds;
  }

  get serviceId(): string | null {
    return this.config.serviceId;
  }

  get module(): SparkServiceModule | null {
    return sparkStore.moduleById(this.serviceId);
  }

  get profile(): SetpointProfileBlock | null {
    return this.module?.blockByLink(this.config.profile) ?? null;
  }

  get controlMode(): string | null {
    return this.config.activeMode;
  }

  set controlMode(v: string | null) {
    this.config.activeMode = v;
    this.saveConfig();
  }

  get modeOpts(): SelectOption[] {
    return this.config.modes.map(m => ({ label: m.title, value: m.id }));
  }

  saveMode(mode: TempControlMode): void {
    this.config.modes = spliceById(this.config.modes, mode);
    this.saveConfig();
  }
}
</script>

<template>
  <CardWrapper v-bind="{context}">
    <template #toolbar>
      <component
        :is="toolbarComponent"
        :crud="crud"
        :mode.sync="mode"
      />
    </template>

    <component :is="mode" :crud="crud">
      <template #warnings>
        <CardWarning v-if="false">
          <template #message>
            TODO
          </template>
        </CardWarning>
      </template>
    </component>
  </CardWrapper>
</template>
