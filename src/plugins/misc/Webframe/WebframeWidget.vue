<script lang="ts">
import { Component } from 'vue-property-decorator';

import WidgetBase from '@/components/WidgetBase';

import { WebframeConfig } from './types';

@Component
export default class WebframeWidget extends WidgetBase<WebframeConfig> {

}
</script>


<template>
  <CardWrapper v-bind="{context}" no-scroll>
    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode" />
    </template>

    <iframe
      v-if="mode === 'Basic'"
      :src="config.url"
      referrerpolicy="no-referrer"
      allowfullscreen
      class="fit q-pa-xs"
      style="border: none"
    />

    <div
      v-if="mode === 'Full'"
      class="q-pa-md row"
    >
      <InputField
        :value="config.url"
        title="URL"
        label="URL"
        class="col-grow"
        @input="v => { config.url = v; saveConfig(); }"
      />
    </div>
  </CardWrapper>
</template>
