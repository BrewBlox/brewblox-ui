<script lang="ts">
import { Component } from 'vue-property-decorator';

import WidgetBase from '@/components/WidgetBase';
import { serviceStore } from '@/store/services';

import { tiltStore } from '../store';
import { TiltStateValue } from '../types';
import { TiltWidgetConfig } from './types';


@Component
export default class TiltWidget extends WidgetBase<TiltWidgetConfig> {

  get serviceOpts(): SelectOption<string>[] {
    return serviceStore
      .services
      .filter(v => v.type === 'Tilt')
      .map(v => ({ label: v.title, value: v.id }));
  }

  get colorOpts(): SelectOption<string>[] {
    return [
      'Red',
      'Green',
      'Black',
      'Purple',
      'Orange',
      'Blue',
      'Yellow',
      'Pink',
    ]
      .sort()
      .map(v => ({ label: v, value: v }));
  }

  get value(): TiltStateValue | null {
    return tiltStore
      .values
      .find(v => v.serviceId === this.config.serviceId
        && v.color === this.config.color)
      ?? null;
  }
}
</script>

<template>
  <CardWrapper v-bind="{context}">
    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode" />
    </template>

    <div
      v-if="mode === 'Basic'"
      class="widget-body"
    >
      <TiltValues
        v-if="value"
        :value="value"
      />
      <CardWarning v-else-if="config.serviceId && config.color">
        <template #message>
          Tilt not found
        </template>
      </CardWarning>
      <CardWarning v-else>
        <template #message>
          No Tilt selected
        </template>
      </CardWarning>
    </div>

    <div
      v-if="mode === 'Full'"
      class="widget-body column q-mt-none"
    >
      <SelectField
        label="Service"
        :options="serviceOpts"
        :value="config.serviceId"
        @input="v => { config.serviceId = v; saveConfig(); }"
      />
      <SelectField
        label="Color"
        :options="colorOpts"
        :value="config.color"
        @input="v => { config.color = v; saveConfig(); }"
      />
    </div>
  </CardWrapper>
</template>
