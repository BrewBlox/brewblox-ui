<script lang="ts">
import { Component } from 'vue-property-decorator';

import WidgetBase from '@/components/WidgetBase';

import { WebframeConfig } from './types';


@Component
export default class WebframeWidget extends WidgetBase<WebframeConfig> {

  get scale(): number {
    return this.config.scale || 1;
  }

  get counterScale(): number {
    // value * scale * counterScale == value
    return ((1 - this.scale) / this.scale) + 1;
  }
}
</script>


<template>
  <CardWrapper v-bind="{context}" no-scroll>
    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode" />
    </template>

    <div
      v-if="mode === 'Basic'"
      style="overflow: hidden"
      class="fit"
    >
      <iframe
        :src="config.url"
        referrerpolicy="no-referrer"
        allowfullscreen
        :style="{
          margin: '1%',
          border: 'none',
          transform: `scale(${scale})`,
          transformOrigin: '0 0',

          // Desired width/height is 98%. (1% margin)
          // To offset scaling, we need to increase/decrease size.
          // If scale == 0.5, then width/height must be 196%
          width: 98 * counterScale + '%',
          height: 98 * counterScale + '%',
        }"
      />
    </div>

    <div
      v-if="mode === 'Full'"
      class="widget-body column q-mt-none"
    >
      <InputField
        :value="config.url"
        title="URL"
        label="URL"
        class="col-grow"
        @input="v => { config.url = v; saveConfig(); }"
      />

      <InputField
        :value="scale * 100"
        type="number"
        label="Content size"
        title="Set zoom level"
        class="col-grow"
        suffix="%"
        :decimals="0"
        :rules="[
          v => v === null || v > 0 || 'Value must be > 0',
        ]"
        @input="v => { config.scale = (v || 100) / 100; saveConfig(); }"
      />
    </div>
  </CardWrapper>
</template>
